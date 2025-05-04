import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// Subscribe to real-time updates
export const subscribeToLeads = (setLeads, uid) => {
  const q = collection(db, 'leads', uid, 'items'); // Using user-specific path

  return onSnapshot(q, (snapshot) => {
    const groupedLeads = {
      New: [],
      Contacted: [],
      'Demo Scheduled': [],
      Closed: [],
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      groupedLeads[data.status]?.push({ id: doc.id, ...data });
    });

    setLeads(groupedLeads);
  });
};

// Add a new lead
export const addLead = async (uid, lead) => {
  try {
    await addDoc(collection(db, 'leads', uid, 'items'), {
      ...lead,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Error adding lead: ', e);
  }
};

// Update lead status
export const updateLeadStatus = async (uid, leadId, newStatus) => {
  try {
    const leadRef = doc(db, 'leads', uid, 'items', leadId);
    await updateDoc(leadRef, { status: newStatus });
  } catch (e) {
    console.error('Error updating lead status: ', e);
  }
};

// Delete a lead
export const deleteLead = async (uid, leadId) => {
  try {
    await deleteDoc(doc(db, 'leads', uid, 'items', leadId));
  } catch (e) {
    console.error('Error deleting lead: ', e);
  }
};
