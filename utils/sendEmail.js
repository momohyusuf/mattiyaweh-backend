const nodemailer = require("nodemailer");

const sendEmail = async ({ userEmail, subject, html }) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SEND_MAIL_USER, // generated ethereal user
      pass: process.env.SEND_MAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Mattiyaweh" <starkweb2@gmail.com>`, // sender address
    to: `${userEmail}`, // list of receivers
    subject: `${subject}`, // Subject line
    html: `${html}`, // html body
  });
};

module.exports = sendEmail;
