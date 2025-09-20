import nodemailer from 'nodemailer';


// Map sender emails to their SMTP credentials
const senders = {
  'omaraws911@gmail.com': {
    user: process.env.SMTP_USER1,
    pass: process.env.SMTP_PASS1,
  },
  'monusan2590@gmail.com': {
    user: process.env.SMTP_USER2,
    pass: process.env.SMTP_PASS2,
  },
};


 const sendEmail = async ({ from, to, subject, text }) => {
  if (!senders[from]) {
    throw new Error(`SMTP configuration not found for sender: ${from}`);
  }

  const { user, pass } = senders[from];

  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use `host`, `port`, `secure` for custom SMTP
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendEmail;
