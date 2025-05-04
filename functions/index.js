const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
admin.initializeApp();

const db = admin.firestore();

// Set SendGrid API Key
sgMail.setApiKey(functions.config().sendgrid.key);

// Scheduled function to send follow-up reminders
exports.sendFollowUpReminders = functions.pubsub
  .schedule('every 24 hours') // Runs every day
  .onRun(async (context) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date

    // Fetch leads where follow-up date matches today's date
    const leadsSnapshot = await db.collection('leads').get();

    leadsSnapshot.forEach(async (leadDoc) => {
      const leadData = leadDoc.data();
      if (leadData.followUpDate === today && leadData.status !== 'Closed') {
        const msg = {
          to: leadData.email,
          from: 'your-email@example.com',
          subject: `Reminder: Follow up with ${leadData.name}`,
          text: `Hi ${leadData.name},\n\nPlease remember to follow up with ${leadData.company}.\n\nNotes: ${leadData.notes}`,
        };

        // Send email using SendGrid
        try {
          await sgMail.send(msg);
          console.log(`Reminder sent to ${leadData.email}`);
        } catch (error) {
          console.error(`Error sending reminder to ${leadData.email}:`, error);
        }
      }
    });

    return null;
  });
