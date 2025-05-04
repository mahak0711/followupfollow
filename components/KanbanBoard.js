import React, { useState, useEffect } from 'react';
import { subscribeToLeads, addLead, updateLeadStatus } from '../lib/firestore'; // Import from firestore.js
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

const KanbanBoard = () => {
  const [user] = useAuthState(auth); // Get the logged-in user
  const [leads, setLeads] = useState({
    New: [],
    Contacted: [],
    'Demo Scheduled': [],
    Closed: [],
  });
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    status: 'New',
  });
  const [isFormVisible, setIsFormVisible] = useState(false); // Track form visibility

  // Subscribe to real-time updates from Firestore when user is authenticated
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToLeads(setLeads, user.uid);

      // Cleanup the subscription when the component is unmounted
      return () => unsubscribe();
    }
  }, [user]);

  // Handle adding a new lead
  const handleAddLead = async () => {
    if (user && newLead.name && newLead.email && newLead.company) {
      try {
        await addLead(user.uid, newLead); // Add the lead to Firestore
        setNewLead({ name: '', email: '', company: '', status: 'New' }); // Clear the form
        setIsFormVisible(false); // Hide the form after adding lead
      } catch (error) {
        console.error('Error adding lead: ', error);
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  // Handle moving a lead from one column to another
  const handleMoveLead = (leadId, newStatus) => {
    if (user) {
      try {
        updateLeadStatus(user.uid, leadId, newStatus);
      } catch (error) {
        console.error('Error moving lead: ', error);
      }
    }
  };

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      const leadId = active.id;
      const newStatus = over.id; // Assuming droppable id corresponds to the status
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
              onMoveLead={handleMoveLead}
            />
          ))}
        </div>
      </DndContext>

      

    </div>
  );
};

const KanbanColumn = ({ status, leads, onMoveLead }) => {
  const { setNodeRef } = useDroppable({ id: status }); // Make the column droppable

  return (
    <div
      className="kanban-column bg-white p-6 border rounded-lg w-80 shadow-lg"
      ref={setNodeRef}
    >
      <h3 className="font-bold text-xl text-center text-gray-800 mb-4">{status}</h3>
      {leads.map((lead) => (
        <KanbanCard key={lead.id} lead={lead} onMoveLead={onMoveLead} />
      ))}
    </div>
  );
};

const KanbanCard = ({ lead, onMoveLead }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: lead.id,
  });

  return (
    <div
      className="kanban-card p-4 mb-4 bg-white border rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
      ref={setNodeRef}
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
