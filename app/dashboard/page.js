"use client"
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import KanbanBoard from "@/components/KanbanBoard";
import LeadDetailModal from "@/components/LeadDetailModal"; // Import LeadDetailModal
import AnalyticsDashboard from "./AnalyticsDashboard";

const STAGES = ["New", "Contacted", "Demo Scheduled", "Closed"];

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [columns, setColumns] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null); // To hold the selected lead
  const [showModal, setShowModal] = useState(false); // To control the modal visibility

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

      console.log("Fetched Leads by Stage:", leadsByStage); // Log fetched leads
      setColumns(leadsByStage);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Kanban Dashboard</h1>
      </div>

      <KanbanBoard
        initialColumns={columns}
        onLeadClick={(lead) => {
          console.log("Lead clicked:", lead);  // Log the clicked lead
          setSelectedLead(lead);
          setShowModal(true);  // Show the modal
        }}
      />

      {/* Display the LeadDetailModal if selectedLead is not null */}
      {showModal && (
        <LeadDetailModal lead={selectedLead} onClose={() => setShowModal(false)} />
      )}
      <AnalyticsDashboard />
    </div>
  );
};

export default Dashboard;
