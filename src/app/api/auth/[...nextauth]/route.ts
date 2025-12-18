import NextAuth, {
  NextAuthOptions,
  type User as NextAuthUser,
  type Session as NextAuthSession,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";

// Module augmentation DO PRÓPRIO NEXTAUTH (no mesmo arquivo)
declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        const authUser: NextAuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        return authUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user && "role" in user) {
        token.role = user.role;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: NextAuthSession;
      token: JWT;
    }): Promise<NextAuthSession> {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
