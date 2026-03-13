import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error:  '/auth/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        // Usuarios OAuth no tienen contraseña local
        if (!user.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.username = (user as any).username
        token.role     = (user as any).role
        // NUNCA incluir image en el token — si es Base64 revienta la cookie (431)
        delete token.picture
        delete (token as any).image
      }
      // Asegurarse de que nunca haya imagen en el token
      delete token.picture
      delete (token as any).image
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id as string
        session.user.username = token.username as string
        session.user.role     = token.role as string
        // Eliminar imagen de la sesión — el sidebar la carga via /api/user/avatar
        delete (session.user as any).image
      }
      return session
    },
  },
})
