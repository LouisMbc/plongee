import { z } from 'zod';

export const registerSchema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  photo_profil: z.string().optional(),
});

export const loginSchema = z.object({
  pseudo: z.string().min(1, 'Le pseudo est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const updateProfileSchema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères').optional(),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  photo_profil: z.string().nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
