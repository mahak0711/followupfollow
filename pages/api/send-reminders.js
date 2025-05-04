import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

const app = initializeApp({ credential: applicationDefault() });
const db = getFirestore(app);

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set in Vercel dashboard

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Only GET allowed');
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
          from: 'kankariamahak7@gmail.com', // Use verified sender
          subject: `Follow-up Reminder: ${lead.name}`,
          text: `Hi,\nReminder to follow up with ${lead.name} from ${lead.company || 'N/A'}.\n\nNotes: ${lead.notes || 'No notes'}.\n\nRegards,\nYour CRM App`,
        };

        await sgMail.send(msg);
        await db
          .collection(`leads/${userDoc.id}/items/${leadDoc.id}/activity`)
          .add({
            type: 'reminder_sent',
            timestamp: new Date(),
            metadata: { email: lead.email },
          });
      }
    }

    res.status(200).json({ message: 'Reminders sent' });
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
