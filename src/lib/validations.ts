import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  // Campos opcionales del perfil
  bio:      z.string().max(200, 'Máximo 200 caracteres').optional(),
  website:  z.string().url('URL inválida').optional().or(z.literal('')),
  location: z.string().max(80).optional(),
  country:  z.string().max(60).optional(),
})

export const createPostSchema = z.object({
  content: z.string().min(1, 'El post no puede estar vacío').max(500, 'Máximo 500 caracteres'),
  codeSnip: z.string().max(2000).optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).max(5, 'Máximo 5 tags').optional(),
})

export const updateProfileSchema = z.object({
  name:     z.string().min(2, 'Mínimo 2 caracteres').max(50).optional(),
  bio:      z.string().max(200, 'Máximo 200 caracteres').optional(),
  website:  z.string().url('URL inválida').optional().or(z.literal('')),
  location: z.string().max(80).optional(),
  country:  z.string().max(60).optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1).max(300),
  postId: z.string(),
  parentId: z.string().optional(),
})

export const createProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).max(10),
})

export const createJobSchema = z.object({
  title: z.string().min(3).max(100),
  company: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']),
  salary: z.string().optional(),
  description: z.string().min(10).max(5000),
  url: z.string().url().optional().or(z.literal('')),
})

export const createGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal('')),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreatePost = z.infer<typeof createPostSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>
export type CreateComment = z.infer<typeof createCommentSchema>
export type CreateProject = z.infer<typeof createProjectSchema>
export type CreateJob = z.infer<typeof createJobSchema>
export type CreateGroup = z.infer<typeof createGroupSchema>
