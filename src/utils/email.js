import nodemailer from "nodemailer";

// Create a transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT),
//   secure: process.env.SMTP_SECURE === "true" || false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   pool: true, 
//   maxConnections: 3, 
//   maxMessages: 50,
//   rateLimit: 5,   
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // Your Gmail address
    pass: process.env.SMTP_PASS, // Your Gmail app password
  },
});


// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: "lejonavr@gmail.com", // Ensure the full email address is used
//     clientId: "372164263040-dk9lhra2la3are24ru93f3mbph5ggckq.apps.googleusercontent.com",
//     clientSecret: "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",
//     refreshToken: "1//04Yh2nU7oobi2CgYIARAAGAQSNwF-L9IrhFDcj6imRKN-6zEIpT_P7DGIUfNHX4uDPK9mLxDZideWRAVRSX2PVLCa-zV0_WNdpfY",
//   },
// });

// Define a function to send an email
const sendEmail = async (mailOptions) => {
  try {
    if (process.env.SEND_EMAIL === "false") {
      console.log("Email not sent because SEND_EMAIL is set to false");
      return;
    }
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

export default sendEmail;
