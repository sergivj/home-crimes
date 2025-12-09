import nodemailer from 'nodemailer';

type EmailAttachment = {
  filename?: string;
  path: string;
};

interface SendAccessEmailParams {
  to: string;
  code: string;
  productTitle: string;
  productSlug: string;
  attachments?: EmailAttachment[];
}

const buildTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP credentials missing. Emails will be logged instead of sent.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });
};

export const sendAccessEmail = async ({
  to,
  code,
  productTitle,
  productSlug,
  attachments = [],
}: SendAccessEmailParams) => {
  const transporter = buildTransporter();

  const html = `
    <h2>¡Caso desbloqueado!</h2>
    <p>Gracias por tu compra. Este es tu código de acceso para el salón de juego:</p>
    <p style="font-size:20px;font-weight:bold;letter-spacing:1px;">${code}</p>
    <p>Úsalo en <a href="${process.env.APP_URL || 'http://localhost:3000'}/game-access?product=${productSlug}">la sala de juego</a> para arrancar tu investigación de <strong>${productTitle}</strong>.</p>
    <p>Si el acceso directo falla, puedes copiar y pegar el código en la pantalla de desbloqueo.</p>
    <p>Te adjuntamos también los archivos clave de tu pedido por si necesitas descargarlos.</p>
  `;

  if (!transporter) {
    console.log('[EMAIL:DRY_RUN]', {
      to,
      subject: `Código de acceso - ${productTitle}`,
      code,
      attachments,
    });
    return;
  }

  await transporter.sendMail({
    to,
    from: process.env.SMTP_FROM || 'Home Crimes <no-reply@homecrimes.com>',
    subject: `Código de acceso - ${productTitle}`,
    html,
    ...(attachments.length ? { attachments } : {}),
  });
};
