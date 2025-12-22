import { getServerSession } from 'next-auth/next'
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from '@auth/prisma-adapter'
// import prisma from '@/pages/api/_lib/prisma';
import prisma from '@/lib/prisma'
// import { sendVerificationRequest } from '@/utils/send-verification-request'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // Add user ID to session from token
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    }
  }
}

export function getSession() {
  return getServerSession(authOptions)
}
