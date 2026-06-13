import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user
      const isAdminPath = nextUrl.pathname.startsWith('/admin')
      const isLoginPage = nextUrl.pathname === '/admin/login'

      if (!isAdminPath || isLoginPage) return true
      if (!isLoggedIn) return false

      const adminEmails = (process.env.ADMIN_EMAIL ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
      if (adminEmails.length > 0 && !adminEmails.includes((session.user?.email ?? '').toLowerCase())) {
        return Response.redirect(new URL('/admin/login?error=access_denied', nextUrl))
      }

      return true
    },
  },
})
