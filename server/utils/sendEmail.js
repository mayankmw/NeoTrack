const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendEmail = async (to, subject, text, htmlTemplatePath, templateVariables = {}) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Load and customize HTML template
    let html = "";
    if (htmlTemplatePath) {
      const templatePath = path.resolve(htmlTemplatePath);
      html = fs.readFileSync(templatePath, "utf8");

      // Replace placeholders
      for (const [key, value] of Object.entries(templateVariables)) {
        html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
      }
    }

    // Email options
    const mailOptions = {
      from: `"NeoTrack" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
