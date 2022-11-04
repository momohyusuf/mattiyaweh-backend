const sendEmail = require("./sendEmail");

const sendEmailVerification = async ({ userEmail, subject, html }) => {
  return sendEmail({
    userEmail,
    subject,
    html,
  });
};

module.exports = sendEmailVerification;
