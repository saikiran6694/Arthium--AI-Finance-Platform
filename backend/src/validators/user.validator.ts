import { z } from "zod";

export const updateUserSchmea = z.object({
  name: z.string().trim().min(1).max(255).optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchmea>;
