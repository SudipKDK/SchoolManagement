/**
 * Auth Validators
 *
 * WHY ZOD v4 NOTE:
 * This project uses Zod v4 (zod@^4.x). In Zod v4, the `required_error`
 * and `invalid_type_error` params were unified into a single `error` param.
 * Use `z.string({ error: "..." })` instead of `z.string({ required_error: "..." })`.
 */

import { z } from "zod";

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Must be a valid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
  }),
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Must be a valid email address")
      .toLowerCase()
      .trim(),
    password: z.string({ error: "Password is required" }),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────
// Deriving TypeScript types from Zod schemas keeps them in sync automatically.
// If you update the schema, the type updates too — no manual maintenance.

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
