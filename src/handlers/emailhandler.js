require("dotenv").config();
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

class EmailHandler {
  async sendEmail(email, body, subject, cc = "", attachments = []) {
    try {
      console.log("email", email);
      const transporter = nodemailer.createTransport(
        smtpTransport({
          host: process.env.SMTP_HOST,
          secure: false,
          port: process.env.SMTP_PORT,
          // secureConnection: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          // tls: {
          // do not fail on invalid certs
          // rejectUnauthorized: false,
          // ciphers:'SSLv3'
          // },
        })
      );
      console.log(transporter.transporter.options.auth, "testingmail");
      transporter.verify(function (error, success) {
        console.log(error, success);
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
      const mailOptions = {
        from: process.env.SMTP_MAIL_FROM,
        to: email,
        subject,
        html: body,
      };
      if (attachments.length > 0) {
        mailOptions["attachments"] = attachments;
      }

      if (cc != "") {
        mailOptions["cc"] = cc;
      }
      console.log(mailOptions);
      await transporter.sendMail(mailOptions).then(
        (result) => {
          console.log("email success:: ", result);
          return result;
        },
        (error) => {
          console.log("email error:: ", error);
          return error;
        }
      );
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
module.exports = new EmailHandler();
