import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as authService from './auth.service.js';
import { prisma } from '../../../lib/prisma.js';
import { generateRefreshToken } from '../../../utils/jwt.js';

describe('Auth Service - Lifecycle Methods', () => {
  const userId = 'usr_mock_123';
  let originalFindUnique: any;
  let originalDelete: any;
  let originalTransaction: any;
  let originalUserFindUnique: any;

  beforeEach(() => {
    originalFindUnique = prisma.refreshToken.findUnique;
    originalDelete = prisma.refreshToken.delete;
    originalTransaction = prisma.$transaction;
    originalUserFindUnique = prisma.user.findUnique;
  });

  afterEach(() => {
    prisma.refreshToken.findUnique = originalFindUnique;
    prisma.refreshToken.delete = originalDelete;
    prisma.$transaction = originalTransaction;
    prisma.user.findUnique = originalUserFindUnique;
  });

  it('refresh should fail when no token is provided', async () => {
    await assert.rejects(
      async () => {
        await authService.refresh(undefined);
      },
      {
        message: 'Refresh token is required',
        statusCode: 401,
      }
    );
  });

  it('refresh should fail when token is invalid or expired cryptographically', async () => {
    await assert.rejects(
      async () => {
        await authService.refresh('invalid.jwt.token');
      },
      {
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      }
    );
  });

  it('refresh should fail if token is not found in database (revoked)', async () => {
    const validJwt = generateRefreshToken({ id: userId });
    prisma.refreshToken.findUnique = (async () => null) as any;

    await assert.rejects(
      async () => {
        await authService.refresh(validJwt);
      },
      {
        message: 'Refresh token has been revoked or is invalid',
        statusCode: 401,
      }
    );
  });

  it('refresh should rotate token and return new tokens when valid', async () => {
    const validJwt = generateRefreshToken({ id: userId });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    prisma.refreshToken.findUnique = (async () => ({
      id: 'rt_1',
      userId,
      token: validJwt,
      expiresAt,
      createdAt: new Date(),
    })) as any;

    prisma.$transaction = (async (fn: any) => {
      return fn({
        refreshToken: {
          delete: async () => ({ id: 'rt_1' }),
          create: async ({ data }: any) => ({
            id: 'rt_2',
            ...data,
            createdAt: new Date(),
          }),
        },
      });
    }) as any;

    const result = await authService.refresh(validJwt);

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.notEqual(result.refreshToken, validJwt);
  });

  it('logout should call delete on refreshToken table when token is passed', async () => {
    let deletedWhere: any = null;
    prisma.refreshToken.delete = (async (args: any) => {
      deletedWhere = args.where;
      return { id: 'rt_1' };
    }) as any;

    await authService.logout('token_to_delete');
    assert.deepEqual(deletedWhere, { token: 'token_to_delete' });
  });

  it('getMe should return formatted user profile with schools and permissions', async () => {
    prisma.user.findUnique = (async () => ({
      id: userId,
      email: 'user@school.org',
      createdAt: new Date('2026-01-01'),
      roles: [
        {
          id: 'ur_1',
          schoolId: 'sch_1',
          school: { id: 'sch_1', name: 'Lincoln Academy' },
          role: {
            id: 'r_admin',
            name: 'SCHOOL_ADMIN',
            permissions: [{ permission: 'student.create' }, { permission: 'student.read' }],
          },
        },
      ],
    })) as any;

    const profile = await authService.getMe(userId);

    assert.equal(profile.id, userId);
    assert.equal(profile.email, 'user@school.org');
    assert.equal(profile.roles.length, 1);
    assert.equal(profile.roles[0]?.schoolName, 'Lincoln Academy');
    assert.equal(profile.roles[0]?.role, 'SCHOOL_ADMIN');
    assert.deepEqual(profile.roles[0]?.permissions, ['student.create', 'student.read']);
  });
});
