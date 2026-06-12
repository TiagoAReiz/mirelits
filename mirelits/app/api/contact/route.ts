import { Resend } from 'resend'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, projectType, message } = body

  if (!name || !email || !message) {
    return Response.json({ error: 'name, email e message são obrigatórios' }, { status: 400 })
  }

  const to = process.env.CONTACT_EMAIL ?? process.env.ADMIN_EMAIL
  if (!to) {
    // Se não há email configurado, apenas retorna ok (falha silenciosa em dev)
    console.warn('[contact] CONTACT_EMAIL ou ADMIN_EMAIL não configurado')
    return Response.json({ ok: true })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[contact] RESEND_API_KEY não configurado. Simulação de envio com sucesso.')
    return Response.json({ ok: true })
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'noreply@mirelits.com',
      to,
      replyTo: email,
      subject: `Nova proposta de projeto — ${projectType ?? 'Geral'}`,
      html: `
        <p><strong>De:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Tipo de projeto:</strong> ${projectType ?? '—'}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    })
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[contact] Resend error:', e)
    return Response.json({ error: 'Falha ao enviar e-mail.' }, { status: 500 })
  }
}
