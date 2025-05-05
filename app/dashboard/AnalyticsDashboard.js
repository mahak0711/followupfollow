"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const STAGES = ["New", "Contacted", "Demo Scheduled", "Closed"];

const AnalyticsDashboard = () => {
  const [user] = useAuthState(auth);
  const [leadsByStage, setLeadsByStage] = useState([]);
  const [leadsPerDay, setLeadsPerDay] = useState([]);
  const [conversionRate, setConversionRate] = useState(0);
  const [avgTimeInStage, setAvgTimeInStage] = useState(0);

  useEffect(() => {
    if (!user) return;

    const leadsRef = collection(db, "leads", user.uid, "items");

    // Leads by stage
    const unsubscribeLeadsByStage = onSnapshot(leadsRef, (snapshot) => {
      const stageCounts = { New: 0, Contacted: 0, "Demo Scheduled": 0, Closed: 0 };
      snapshot.forEach((doc) => {
        const lead = doc.data();
        if (STAGES.includes(lead.status)) {
          stageCounts[lead.status]++;
        }
      });
      setLeadsByStage([
        { name: "New", value: stageCounts.New, fill: "#60a5fa" },           
        { name: "Contacted", value: stageCounts.Contacted, fill: "#34d399" },
        { name: "Demo Scheduled", value: stageCounts["Demo Scheduled"], fill: "#fbbf24" }, 
        { name: "Closed", value: stageCounts.Closed, fill: "#f87171" },     // red-400
      ]);
      
    });

    // Leads created per day
    const unsubscribeLeadsPerDay = onSnapshot(leadsRef, (snapshot) => {
      const leadsCountPerDay = {};
      snapshot.forEach((doc) => {
        const lead = doc.data();
        if (lead.createdAt?.toDate) {
          const createdAt = lead.createdAt.toDate();
          const day = createdAt.toISOString().split("T")[0];
          leadsCountPerDay[day] = (leadsCountPerDay[day] || 0) + 1;
        }
      });

      const sortedLeads = Object.keys(leadsCountPerDay).map((date) => ({
        date,
        count: leadsCountPerDay[date],
      }));

      setLeadsPerDay(sortedLeads.sort((a, b) => new Date(a.date) - new Date(b.date)));
    });

    // Activities: Conversion Rate & Avg Time
    const unsubscribeLeadActivities = onSnapshot(
      collection(db, "activities", user.uid, "logs"),
      (activitySnapshot) => {
        let totalLeadsCreated = 0;
        let totalLeadsClosed = 0;
        let totalTimeInStage = 0;
        let leadsCount = 0;

        activitySnapshot.forEach((doc) => {
          const activity = doc.data();
          if (activity.type === "lead_created") {
            totalLeadsCreated++;
          } else if (activity.type === "lead_closed") {
            totalLeadsClosed++;
            if (activity.timeInStage) {
              totalTimeInStage += activity.timeInStage;
              leadsCount++;
            }
          }
        });

        setConversionRate(
          totalLeadsCreated > 0
            ? ((totalLeadsClosed / totalLeadsCreated) * 100).toFixed(2)
            : 0
        );
        setAvgTimeInStage(
          leadsCount > 0 ? (totalTimeInStage / leadsCount).toFixed(2) : 0
        );
      }
    );

    return () => {
      unsubscribeLeadsByStage();
      unsubscribeLeadsPerDay();
      unsubscribeLeadActivities();
    };
  }, [user]);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        Analytics Dashboard
      </h1>

      {/* Lead Funnel Chart */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-medium text-gray-600 mb-4">Lead Funnel</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              
              <Funnel
                data={leadsByStage}
                dataKey="value"
                isAnimationActive
                shape="rectangular"
              >
                <LabelList
                  position="center"
                  dataKey="name"
                  fill="#000"
                  fontSize={16}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Leads Created per Day
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={leadsPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-3xl font-semibold text-blue-600">
            {conversionRate}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Average Time in Stage (days)</p>
          <p className="text-3xl font-semibold text-blue-600">
            {avgTimeInStage} days
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
