const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendWelcomeEmail = async (email, fullName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SkillSetu!',
      text: `Hi ${fullName},\n\nWelcome to SkillSetu! We are excited to have you on board. Start sharing and learning skills today!\n\nBest,\nThe SkillSetu Team`,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const sendSessionRequestEmail = async (email, fullName, senderName, topic) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Session Request - SkillSetu',
      text: `Hi ${fullName},\n\nYou have received a new session request from ${senderName} for the topic: "${topic}".\n\nLog in to your account to accept or decline the request.\n\nBest,\nThe SkillSetu Team`,
    });
  } catch (error) {
    console.error('Error sending session request email:', error);
  }
};

const sendSessionCompletedEmail = async (email, fullName, topic) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Session Completed - SkillSetu',
      text: `Hi ${fullName},\n\nYour session on "${topic}" has been marked as completed. Please log in to leave a rating and review your experience.\n\nBest,\nThe SkillSetu Team`,
    });
  } catch (error) {
    console.error('Error sending session completed email:', error);
  }
};

const sendCreditsEarnedEmail = async (email, fullName, learnerName, creditsEarned, totalCredits) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'You Earned Credits! - SkillSetu',
      text: `Hi ${fullName},\n\nGreat news! You have earned ${creditsEarned} credits for completing a session with ${learnerName}.\n\nYour new total balance is ${totalCredits} credits.\n\nKeep up the great work!\n\nBest,\nThe SkillSetu Team`,
    });
  } catch (error) {
    console.error('Error sending credits earned email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendSessionRequestEmail,
  sendSessionCompletedEmail,
  sendCreditsEarnedEmail,
};
