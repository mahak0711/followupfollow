import React, { useState, useEffect } from 'react';
import { subscribeToLeads, addLead, updateLeadStatus } from '../lib/firestore';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

const KanbanBoard = ({ onLeadClick }) => {
  const [user] = useAuthState(auth);
  const [leads, setLeads] = useState({
    New: [],
    Contacted: [],
    'Demo Scheduled': [],
    Closed: [],
  });

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToLeads(setLeads, user.uid);
      return () => unsubscribe();
    }
  }, [user]);

  const handleMoveLead = (leadId, newStatus) => {
    if (user) {
      try {
        updateLeadStatus(user.uid, leadId, newStatus);
      } catch (error) {
        console.error('Error moving lead: ', error);
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      const leadId = active.id;
      const newStatus = over.id;
      handleMoveLead(leadId, newStatus);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="kanban-board flex space-x-6">
          {['New', 'Contacted', 'Demo Scheduled', 'Closed'].map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={leads[status]}
              onCardClick={onLeadClick}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

const KanbanColumn = ({ status, leads, onCardClick }) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className="kanban-column bg-white p-6 border rounded-lg w-80 shadow-lg"
      ref={setNodeRef}
    >
      <h3 className="font-bold text-xl text-center text-gray-800 mb-4">{status}</h3>
      {leads.map((lead) => (
        <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
      ))}
    </div>
  );
};

const KanbanCard = ({ lead, onClick }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: lead.id });

  return (
    <div
      className="kanban-card p-4 mb-4 bg-white border rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      ref={setNodeRef}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <p className="font-semibold text-black text-lg">{lead.name}</p>
      <p className="text-sm text-black">{lead.email}</p>
      <p className="text-sm text-gray-600">{lead.company}</p>
    </div>
  );
};

export default KanbanBoard;
