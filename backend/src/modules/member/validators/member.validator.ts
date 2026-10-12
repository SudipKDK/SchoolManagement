import { z } from "zod";

export const addMemberSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Must be a valid email")
      .toLowerCase()
      .trim(),
    roleName: z
      .string({ error: "Role name is required" })
      .trim()
      .toUpperCase(), // e.g. "TEACHER", "STUDENT"
  }),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>["body"];
