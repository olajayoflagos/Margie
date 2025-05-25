/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

admin.initializeApp();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendEmailReceipt = functions.https.onCall(async (data, context) => {
  const { guestEmail, guestName, bookingId, roomName, checkIn, checkOut, amountPaid } = data;

  const doc = new PDFDocument();
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(buffers);

    const mailOptions = {
      from: `Margies Hotel <${gmailEmail}>`,
      to: guestEmail,
      subject: `Booking Confirmation - ${bookingId}`,
      text: `Hello ${guestName},\n\nYour booking is confirmed. Please find your receipt attached.`,
      attachments: [
        {
          filename: `Receipt-${bookingId}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent to:', guestEmail);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });

  // Generate the receipt
  doc.image('logo.png', 50, 45, { width: 80 });
  doc.fontSize(20).text('Margies Hotel Booking Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Booking ID: ${bookingId}`);
  doc.text(`Name: ${guestName}`);
  doc.text(`Room: ${roomName}`);
  doc.text(`Check-In: ${checkIn}`);
  doc.text(`Check-Out: ${checkOut}`);
  doc.text(`Amount Paid: ₦${amountPaid}`);
  doc.end();
});