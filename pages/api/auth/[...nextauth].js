import NextAuth from "next-auth"
import { getServerSession } from 'next-auth/next'
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma";
// import prisma from "@/pages/api/_lib/prisma";


const secret = process.env.NEXTAUTH_SECRET

export const authOptions = {
  // Configure one or more authentication providers 
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET
    // })
  ],
  session: {
    strategy: 'jwt',
  },
  secret: secret,
  callbacks: {
    // Add user ID and role to session from token
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
    // Add role to JWT token
    jwt: async ({ token, user }) => {
      if (user) {
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })
        token.role = dbUser?.role || 'user'
      }
      return token
    }
  }
}

export default NextAuth(authOptions)