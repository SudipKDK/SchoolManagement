import { z } from "zod";

// ─── Create School ────────────────────────────────────────────────────────────

export const createSchoolSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "School name is required" })
      .min(2, "School name must be at least 2 characters")
      .max(100, "School name must be at most 100 characters")
      .trim(),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>["body"];
