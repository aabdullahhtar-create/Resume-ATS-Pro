import { z } from "zod";
import { templates } from "@/lib/templates";

export const authSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});

const templateIds = templates.map((item) => item.id) as [string, ...string[]];

export const resumePayloadSchema = z.object({
  title: z.string().trim().min(1).max(120).default("Untitled Resume"),
  template: z.enum(templateIds).default("eclipse"),
  data: z.record(z.any()),
  atsScore: z.number().int().min(0).max(100).nullable().optional()
});

export const resumePatchSchema = resumePayloadSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required"
);
