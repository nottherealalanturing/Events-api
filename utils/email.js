const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.PASSWORD_PASSWORD,
    },
  });

  const mailOptions = {
    from: "assad@eventsapi.com",
    to: attendees,
    subject: "New event created!",
    text: `A new event called "${event.name}" has been created.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
