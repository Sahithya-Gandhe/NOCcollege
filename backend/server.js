const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
require('dotenv').config();

// const serviceAccount = require(process.env.SERVICE_ACCOUNT_KEY_PATH); // You'll need to create this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Email sending route
app.post("/send-email", async (req, res) => {
  const { studentName, rollNo, branch, mentor, email, facultyEmails } = req.body;

  try {
    // Configure transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail
        pass: process.env.GMAIL_PASS, // your Gmail app password
      },
    });

    // Loop through each selected faculty email
    for (let facultyEmail of facultyEmails) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: facultyEmail,
        subject: "NOC Request",
        html: `
          <p>Dear Faculty,</p>
          <p>The following student has applied for a No Dues Certificate:</p>
          <ul>
            <li><strong>Student Name:</strong> ${studentName}</li>
            <li><strong>Roll No:</strong> ${rollNo}</li>
            <li><strong>Branch:</strong> ${branch}</li>
            <li><strong>Mentor:</strong> ${mentor}</li>
            <li><strong>Email:</strong> ${email}</li>
          </ul>
          <p>Please review and update the remarks for your section.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/noc-request/accept?rollNo=${rollNo}&facultyEmail=${facultyEmail}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Accept</a>
            <a href="${process.env.FRONTEND_URL}/noc-request/reject?rollNo=${rollNo}&facultyEmail=${facultyEmail}" style="background-color: #f44336; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; margin-left: 10px;">Reject</a>
          </p>
          <p>Regards,<br>College Admin</p>
        `,
      });
    }

    res.json({
      success: true,
      message: `Emails sent to ${facultyEmails.join(", ")}`,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});


// Handle NOC request acceptance
app.get("/noc-request/accept", async (req, res) => {
  const { rollNo, facultyEmail } = req.query;

  if (!rollNo || !facultyEmail) {
    return res.status(400).send("Missing rollNo or facultyEmail.");
  }

  try {
    const nocRef = db.collection("nocRequests").doc(rollNo);
    const doc = await nocRef.get();

    if (!doc.exists) {
      return res.status(404).send("NOC request not found.");
    }

    const data = doc.data();
    const facultyStatuses = data.facultyStatuses || {};
    facultyStatuses[facultyEmail] = "Accepted";

    await nocRef.update({ facultyStatuses });

    // Check if all faculty have accepted and none have rejected
    const allAccepted = data.facultyEmails.every(email => facultyStatuses[email] === "Accepted");
    const anyRejected = data.facultyEmails.some(email => facultyStatuses[email] === "Rejected");

    if (allAccepted && !anyRejected) {
      await nocRef.update({ finalStatus: "Accepted" });
    } else if (anyRejected) {
      await nocRef.update({ finalStatus: "Rejected" });
    }

    res.send(`NOC request for ${rollNo} accepted by ${facultyEmail}.`);
  } catch (error) {
    console.error("Error accepting NOC request:", error);
    res.status(500).send("Error processing request.");
  }
});

// Handle NOC request rejection
app.get("/noc-request/reject", async (req, res) => {
  const { rollNo, facultyEmail } = req.query;

  if (!rollNo || !facultyEmail) {
    return res.status(400).send("Missing rollNo or facultyEmail.");
  }

  try {
    const nocRef = db.collection("nocRequests").doc(rollNo);
    const doc = await nocRef.get();

    if (!doc.exists) {
      return res.status(404).send("NOC request not found.");
    }

    const data = doc.data();
    const facultyStatuses = data.facultyStatuses || {};
    facultyStatuses[facultyEmail] = "Rejected";

    await nocRef.update({ facultyStatuses, finalStatus: "Rejected" }); // If any faculty rejects, overall status is rejected

    res.send(`NOC request for ${rollNo} rejected by ${facultyEmail}.`);
  } catch (error) {
    console.error("Error rejecting NOC request:", error);
    res.status(500).send("Error processing request.");
  }
});

app.get("/",(req,res)=>{
  return res.send("Server is running");
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
