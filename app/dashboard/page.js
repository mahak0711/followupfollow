"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import KanbanBoard from "@/components/KanbanBoard";
import LeadDetailModal from "@/components/LeadDetailModal";
import AnalyticsDashboard from "./AnalyticsDashboard";

const STAGES = ["New", "Contacted", "Demo Scheduled", "Closed"];

const addLead = async (userId, leadData) => {
  const leadsRef = collection(db, "leads", userId, "items");
  await addDoc(leadsRef, {
    ...leadData,
    status: "New",
    createdAt: Timestamp.now(),
  });
};

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [columns, setColumns] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    note: '',
    followUpDate: ''
  });
  

  useEffect(() => {
    if (!user) return;

    const leadsRef = collection(db, "leads", user.uid, "items");

    const unsubscribe = onSnapshot(leadsRef, (snapshot) => {
      const leadsByStage = STAGES.map((stage) => ({
        id: stage,
        title: stage,
        leads: [],
      }));

      snapshot.forEach((doc) => {
        const lead = { id: doc.id, ...doc.data() };
        const columnIndex = STAGES.findIndex((s) => s === lead.status);
        if (columnIndex !== -1) {
          leadsByStage[columnIndex].leads.push(lead);
        }
      });

      console.log("Fetched Leads by Stage:", leadsByStage);
      setColumns(leadsByStage);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddLead = () => {
    if (user) {
      try {
        // Assuming you have an `addLead` function in firestore utility
        addLead(user.uid, newLead);
        setNewLead({ name: '', email: '', company: '' });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error adding lead: ", error);
      }
    }
  };

  return (
    <div className="bg-gray-50  p-6">
      
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Kanban Dashboard</h1>

        {/* Add Lead Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none transition duration-200"
        >
          Add Lead
        </button>
      </div>

      {/* Modal for adding a new lead */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl transition-all transform">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Lead</h2>
            <input
              type="text"
              placeholder="Name"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-300 text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="email"
              placeholder="Email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              className="w-full p-3 mb-6 border border-gray-300 text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <textarea
  placeholder="Note"
  value={newLead.note}
  onChange={(e) => setNewLead({ ...newLead, note: e.target.value })}
  className="w-full p-3 mb-4 border border-gray-300 text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
/>

<input
  type="date"
  value={newLead.followUpDate}
  onChange={(e) => setNewLead({ ...newLead, followUpDate: e.target.value })}
  className="w-full p-3 mb-6 border border-gray-300 text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
/>
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLead}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none transition-all"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      <KanbanBoard
        initialColumns={columns}
        onLeadClick={(lead) => {
          console.log("Lead clicked:", lead); // Log the clicked lead
          setSelectedLead(lead);
          setShowModal(true); // Show the modal
        }}
      />

      {/* Display Lead Detail Modal */}
      {showModal && (
        <LeadDetailModal lead={selectedLead} onClose={() => setShowModal(false)} />
      )}

      <AnalyticsDashboard />
    </div>
  );
};

export default Dashboard;
