import { auth } from '@/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return {
      session: null as null,
      error: Response.json({ error: 'Não autorizado' }, { status: 401 }),
    }
  }
  return { session, error: null as null }
}
