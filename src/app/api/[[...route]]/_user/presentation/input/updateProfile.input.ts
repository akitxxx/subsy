import { z } from 'zod';

export const updateProfileInputSchema = z.object({
  nickname: z.string().min(1),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
