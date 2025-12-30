import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '../database/connection';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'),
    updateAge: parseInt(process.env.SESSION_UPDATE_AGE || '3600'),
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        token: { label: '2FA Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('No user found with this email');
        }

        if (user.status !== 'active') {
          throw new Error('Account is not active');
        }

        const isValid = await user.comparePassword(credentials.password);
        
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
          if (!credentials.token) {
            throw new Error('2FA token is required');
          }

          if (!user.twoFactorSecret) {
            throw new Error('2FA not properly configured');
          }

          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: credentials.token,
            window: 1,
          });

          if (!verified) {
            throw new Error('Invalid 2FA token');
          }
        }

        // Update login info
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Log successful login
      console.log(`User ${user.email} signed in`);
    },
    async signOut({ token }) {
      // Log successful logout
      console.log(`User ${token.email} signed out`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);