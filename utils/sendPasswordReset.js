const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ userEmail, subject, html }) => {
  return sendEmail({
    userEmail,
    subject,
    html,
  });
};

module.exports = sendResetPasswordEmail;
