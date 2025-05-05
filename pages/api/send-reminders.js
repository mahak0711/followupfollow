import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import sgMail from "@sendgrid/mail";

let db;

if (!getApps().length) {
  try {
    const decoded = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString("utf8")
    );

    initializeApp({
      credential: cert(decoded),
    });

    db = getFirestore(); // Initialize here after app is ready
  } catch (err) {
    console.error("Firebase Admin initialization error:", err);
  }
} else {
  db = getFirestore(getApp());
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (!db) {
    return res.status(500).json({ error: "Firestore not initialized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const users = await db.collection("leads").listDocuments();

    for (const userDoc of users) {
      const leadsSnapshot = await db
        .collection(`leads/${userDoc.id}/items`)
        .where("followUpDate", "==", today)
        .where("status", "!=", "Closed")
        .get();

      for (const leadDoc of leadsSnapshot.docs) {
        const lead = leadDoc.data();
        if (!lead.email) continue;

        const reminderExists = await db
          .collection(`leads/${userDoc.id}/items/${leadDoc.id}/activity`)
          .where("type", "==", "reminder_sent")
          .where("timestamp", ">=", new Date(`${today}T00:00:00Z`))
          .get();

        if (!reminderExists.empty) {
          console.log(`Reminder already sent for ${lead.name}`);
          continue;
        }

        const msg = {
          to: lead.email,
          from: "kankariamahak7@gmail.com", // ✅ Replace with verified sender
          subject: `Follow-up Reminder: ${lead.name}`,
          text: `Hi,\n\nReminder to follow up with ${lead.name} from ${
            lead.company || "N/A"
          }.\n\nNotes: ${lead.notes || "No notes"}.\n\nRegards,\nYour CRM App`,
        };

        try {
          // Send the reminder email
          await sgMail.send(msg);

          // Log the activity after sending the email
          await db
            .collection(`leads/${userDoc.id}/items/${leadDoc.id}/activity`)
            .add({
              type: "reminder_sent",
              timestamp: new Date(),
              metadata: {
                email: lead.email,
                notes: lead.notes || "No notes",
                leadName: lead.name,
                company: lead.company || "N/A",
              },
            });

          console.log(`Reminder sent and activity logged for ${lead.name}`);
        } catch (error) {
          console.error(`Failed to send email for ${lead.name}:`, error);
        }
      }
    }

    return res.status(200).json({ message: "Reminders sent" });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({ error: "Error fetching leads" });
  }
}
