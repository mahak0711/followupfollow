import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set this in Vercel dashboard

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    const users = await db.collection('leads').listDocuments();

    for (const userDoc of users) {
      const leadsSnapshot = await db
        .collection(`leads/${userDoc.id}/items`)
        .where('followUpDate', '==', today)
        .where('status', '!=', 'Closed')
        .get();

      for (const leadDoc of leadsSnapshot.docs) {
        const lead = leadDoc.data();
        if (!lead.email) continue;

        const msg = {
          to: lead.email,
          from: 'kankariamahak7@gmail.com', // Must be a verified sender on SendGrid
          subject: `Follow-up Reminder: ${lead.name}`,
          text: `Hi,\n\nReminder to follow up with ${lead.name} from ${lead.company || 'N/A'}.\n\nNotes: ${
            lead.notes || 'No notes'
          }.\n\nRegards,\nYour CRM App`,
        };

        try {
          await sgMail.send(msg);

          await db
            .collection(`leads/${userDoc.id}/items/${leadDoc.id}/activity`)
            .add({
              type: 'reminder_sent',
              timestamp: new Date(),
              metadata: { email: lead.email },
            });
        } catch (error) {
          console.error(`Failed to send email for ${lead.name}:`, error);
        }
      }
    }

    return res.status(200).json({ message: 'Reminders sent' });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ error: 'Error fetching leads' });
  }
}
