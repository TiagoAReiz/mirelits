export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, message } = body

  if (!name || !email || !message) {
    return Response.json({ error: 'name, email e message são obrigatórios' }, { status: 400 })
  }

  // Integração com serviço de email (Resend, etc.) a implementar separadamente
  return Response.json({ ok: true })
}
