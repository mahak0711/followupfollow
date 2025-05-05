"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getRecentActivity } from "@/lib/firestore";

export default function LeadDetailModal({ lead, onClose }) {
  const [user] = useAuthState(auth);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !lead?.id) return;

    const unsubscribe = getRecentActivity(user.uid, lead.id, (data) => {
      setActivities(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, lead?.id]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-stone-800 mb-4">
          Lead Details - {lead.name}
        </h2>

        <p className="text-sm text-gray-500 mb-6">{lead.email}</p>

        <h3 className="font-medium  text-gray-500  text-lg mb-2">Recent Activity</h3>

        {loading ? (
          <p>Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <ul className="space-y-2">
            {activities.map((act) => (
              <li
                key={act.id} // Ensure each item has a unique key
                className="text-sm text-gray-700 border-b py-2"
              >
                <strong>{act.type.replace(/_/g, " ")}</strong> -{" "}
                {act.metadata?.note || act.metadata?.newStatus || "Details not available"}
                <div className="text-xs text-gray-400">
                  {act.timestamp?.toDate().toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
