import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_CLIENT_SECRET) {
  throw new Error('Missing Apple OAuth credentials');
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Additional NextAuth.js configuration options
});

export { handler as GET, handler as POST }
