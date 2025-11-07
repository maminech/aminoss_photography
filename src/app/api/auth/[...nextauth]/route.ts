import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // DO NOT use adapter with CredentialsProvider - it breaks session management
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('NextAuth: authorize called with email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.error('NextAuth: Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log('NextAuth: User lookup result:', user ? 'Found' : 'Not found');

          if (!user || !user.password) {
            console.error('NextAuth: User not found or no password');
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('NextAuth: Password check:', isCorrectPassword ? 'Valid' : 'Invalid');

          if (!isCorrectPassword) {
            console.error('NextAuth: Invalid password');
            return null;
          }

          console.log('NextAuth: Authentication successful for user:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('NextAuth: authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('NextAuth: jwt callback', { hasUser: !!user, hasToken: !!token, hasAccount: !!account });
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        console.log('NextAuth: JWT token created with user data:', { id: token.id, email: token.email, role: token.role });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('NextAuth: session callback', { hasSession: !!session, hasToken: !!token });
      if (token && session?.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        console.log('NextAuth: Session created with user:', { id: (session.user as any).id, email: session.user.email });
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log('NextAuth Event: User signed in:', user.email, 'Account:', account?.provider);
    },
    async signOut({ token }) {
      console.log('NextAuth Event: User signed out');
    },
    async session({ session }) {
      console.log('NextAuth Event: Session checked:', session?.user?.email);
    },
  },
  debug: true, // Enable debug for all environments temporarily
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
