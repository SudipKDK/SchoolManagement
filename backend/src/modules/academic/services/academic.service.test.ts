import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as academicService from './academic.service.js';
import * as academicRepo from '../repositories/academic.repository.js';
import { prisma } from '../../../lib/prisma.js';

describe('Academic Service - Phase 2 Operations', () => {
  const schoolId = 'sch_test_123';
  let originalPrisma: any = {};

  beforeEach(() => {
    originalPrisma = {
      academicYear: { ...prisma.academicYear },
      term: { ...prisma.term },
      classroom: { ...prisma.classroom },
      subject: { ...prisma.subject },
      timetablePeriod: { ...prisma.timetablePeriod },
    };
  });

  afterEach(() => {
    Object.assign(prisma.academicYear, originalPrisma.academicYear);
    Object.assign(prisma.term, originalPrisma.term);
    Object.assign(prisma.classroom, originalPrisma.classroom);
    Object.assign(prisma.subject, originalPrisma.subject);
    Object.assign(prisma.timetablePeriod, originalPrisma.timetablePeriod);
  });

  describe('Academic Years', () => {
    it('should reject academic year if startDate is after endDate', async () => {
      await assert.rejects(
        async () => {
          await academicService.createAcademicYear(schoolId, {
            name: '2026-2027',
            startDate: '2027-06-01T00:00:00.000Z',
            endDate: '2026-06-01T00:00:00.000Z',
            isCurrent: true,
          });
        },
        {
          message: 'Start date must be before end date.',
          statusCode: 400,
        }
      );
    });

    it('should reject term if dates fall outside academic year', async () => {
      prisma.academicYear.findFirst = (async () => ({
        id: 'ay_1',
        schoolId,
        name: '2026-2027',
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T00:00:00.000Z'),
        isCurrent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        terms: [],
        classrooms: [],
      })) as any;

      await assert.rejects(
        async () => {
          await academicService.createTerm(schoolId, 'ay_1', {
            name: 'Summer Term',
            startDate: '2027-07-01T00:00:00.000Z',
            endDate: '2027-08-31T00:00:00.000Z',
          });
        },
        {
          message: 'Term dates must fall within the academic year timeframe.',
          statusCode: 400,
        }
      );
    });
  });

  describe('Timetable & Schedule Conflict Detection', () => {
    it('should reject timetable period if startTime >= endTime', async () => {
      await assert.rejects(
        async () => {
          await academicService.createTimetablePeriod(schoolId, {
            classroomId: 'cls_1',
            subjectId: 'sub_1',
            teacherId: 'tch_1',
            dayOfWeek: 'MONDAY',
            startTime: '10:00',
            endTime: '09:00',
          });
        },
        {
          message: 'Start time must be strictly before end time.',
          statusCode: 400,
        }
      );
    });

    it('should detect classroom schedule conflict when classroom is double-booked', async () => {
      prisma.classroom.findFirst = (async () => ({
        id: 'cls_1',
        schoolId,
        name: 'Grade 10-A',
        capacity: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        academicYearId: null,
      })) as any;

      prisma.subject.findFirst = (async () => ({
        id: 'sub_1',
        schoolId,
        name: 'Mathematics',
        code: 'MATH101',
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as any;

      // Existing overlapping period in the same classroom
      prisma.timetablePeriod.findMany = (async () => [
        {
          id: 'tt_existing',
          schoolId,
          classroomId: 'cls_1',
          subjectId: 'sub_physics',
          teacherId: 'tch_2',
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '09:45',
          createdAt: new Date(),
          updatedAt: new Date(),
          classroom: { id: 'cls_1', name: 'Grade 10-A' },
          subject: { id: 'sub_physics', name: 'Physics', code: 'PHY101' },
          teacher: { id: 'tch_2', user: { id: 'u_2', email: 'prof@school.org' } },
        },
      ]) as any;

      await assert.rejects(
        async () => {
          await academicService.createTimetablePeriod(schoolId, {
            classroomId: 'cls_1',
            subjectId: 'sub_1',
            teacherId: 'tch_1',
            dayOfWeek: 'MONDAY',
            startTime: '09:15',
            endTime: '10:00',
          });
        },
        {
          statusCode: 409,
        }
      );
    });

    it('should detect teacher schedule conflict when teacher is scheduled in two classrooms at once', async () => {
      prisma.classroom.findFirst = (async () => ({
        id: 'cls_2',
        schoolId,
        name: 'Grade 10-B',
        capacity: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        academicYearId: null,
      })) as any;

      prisma.subject.findFirst = (async () => ({
        id: 'sub_1',
        schoolId,
        name: 'Mathematics',
        code: 'MATH101',
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as any;

      // Teacher is already teaching in Grade 10-A at this time
      prisma.timetablePeriod.findMany = (async () => [
        {
          id: 'tt_existing',
          schoolId,
          classroomId: 'cls_1',
          subjectId: 'sub_1',
          teacherId: 'tch_1',
          dayOfWeek: 'TUESDAY',
          startTime: '10:00',
          endTime: '10:45',
          createdAt: new Date(),
          updatedAt: new Date(),
          classroom: { id: 'cls_1', name: 'Grade 10-A' },
          subject: { id: 'sub_1', name: 'Mathematics', code: 'MATH101' },
          teacher: { id: 'tch_1', user: { id: 'u_1', email: 'math@school.org' } },
        },
      ]) as any;

      await assert.rejects(
        async () => {
          await academicService.createTimetablePeriod(schoolId, {
            classroomId: 'cls_2',
            subjectId: 'sub_1',
            teacherId: 'tch_1',
            dayOfWeek: 'TUESDAY',
            startTime: '10:15',
            endTime: '11:00',
          });
        },
        {
          statusCode: 409,
        }
      );
    });
  });
});
