import { z } from "zod";

export const createIncidentSchema = z.object({
  title: z.string().min(1, "Incident title is required").max(200, "Title must be 200 characters or less"),
  description: z.string().default(""),
  priority: z.enum(["P0", "P1", "P2", "P3"], { message: "Priority is required" }),
  reporter_name: z.string().min(1, "Reporter name is required").max(100, "Name must be 100 characters or less"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]).optional(),
  assignee: z.string().nullable().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
  service_affected: z.string().nullable().optional(),
});

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

export const createUpdateSchema = z.object({
  message: z.string().min(1, "Update message is required").max(5000, "Message must be 5000 characters or less"),
  author_name: z.string().min(1, "Author name is required").max(100),
});

export type CreateUpdateInput = z.infer<typeof createUpdateSchema>;
