// utils/firestore.js

import { db } from './firebase'; // Firebase configuration file
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Helper function to log activities for each lead
const logActivity = async (uid, leadId, type, metadata = {}) => {
  try {
    await addDoc(collection(db, 'leads', uid, 'items', leadId, 'activity'), {
      type,
      timestamp: serverTimestamp(),
      metadata,
    });
  } catch (e) {
    console.error('Error logging activity: ', e);
  }
};


// Fetch the most recent activities for a specific lead's item
export const getRecentActivity = (leadId, itemId, setActivities) => {
  const activityRef = collection(db, 'leads', leadId, 'items', itemId, 'activity');
  const q = query(activityRef, orderBy('timestamp', 'desc'), limit(5));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => doc.data());
    setActivities(activities);  // Set the fetched activities
  });

  // Return the unsubscribe function for cleanup
  return unsubscribe;
};

// Subscribe to real-time updates for all leads of a user
export const subscribeToLeads = (setLeads, uid) => {
  const leadsRef = collection(db, 'leads', uid, 'items');
  const q = query(leadsRef); // Optional: you can add ordering or filtering

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

    setLeads(groupedLeads); // Update leads state with grouped data
  });
};

// Add a new lead to Firestore
export const addLead = async (uid, lead) => {
  try {
    const docRef = await addDoc(collection(db, 'leads', uid, 'items'), {
      ...lead,
      createdAt: serverTimestamp(),
    });

    // Log activity when a new lead is added
    await logActivity(uid, docRef.id, docRef.id, 'lead_added', { leadName: lead.name });
  } catch (e) {
    console.error('Error adding lead: ', e);
  }
};

// Update the status of an existing lead
export const updateLeadStatus = async (uid, leadId, newStatus) => {
  try {
    const leadRef = doc(db, 'leads', uid, 'items', leadId);
    await updateDoc(leadRef, { status: newStatus });

    // Log activity when lead status is updated
    await logActivity(uid, leadId, 'status_updated', { newStatus });
  } catch (e) {
    console.error('Error updating lead status: ', e);
  }
};


// Delete a lead from Firestore
export const deleteLead = async (uid, leadId) => {
  try {
    await deleteDoc(doc(db, 'leads', uid, 'items', leadId));

    // Log activity when a lead is deleted
    await logActivity(uid, leadId, leadId, 'lead_deleted');
  } catch (e) {
    console.error('Error deleting lead: ', e);
  }
};

// Additional optimization or methods could be added here as needed
