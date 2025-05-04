"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import KanbanBoard from "@/components/KanbanBoard";
import LeadFormModal from "@/components/LeadFormModal";

const STAGES = ["New", "Contacted", "Demo Scheduled", "Closed"];

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [columns, setColumns] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

      setColumns(leadsByStage);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Kanban Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Lead
        </button>
      </div>

      <KanbanBoard initialColumns={columns} />

      {showModal && <LeadFormModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
