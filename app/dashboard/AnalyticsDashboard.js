"use client";
import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { FunnelChart, Funnel, FunnelLabel, LabelList } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const STAGES = ["New", "Contacted", "Demo Scheduled", "Closed"];

const AnalyticsDashboard = () => {
  const [user] = useAuthState(auth);
  const [leadsByStage, setLeadsByStage] = useState([]);
  const [leadsPerDay, setLeadsPerDay] = useState([]);
  const [conversionRate, setConversionRate] = useState(0);
  const [avgTimeInStage, setAvgTimeInStage] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch data for funnel chart and leads per day
    const leadsRef = collection(db, "leads", user.uid, "items");

    // Get leads by stage for the funnel chart
    const unsubscribeLeadsByStage = onSnapshot(leadsRef, (snapshot) => {
      const stageCounts = { New: 0, Contacted: 0, "Demo Scheduled": 0, Closed: 0 };
      snapshot.forEach((doc) => {
        const lead = doc.data();
        if (STAGES.includes(lead.status)) {
          stageCounts[lead.status]++;
        }
      });
      setLeadsByStage([
        { name: "New", value: stageCounts.New },
        { name: "Contacted", value: stageCounts.Contacted },
        { name: "Demo Scheduled", value: stageCounts["Demo Scheduled"] },
        { name: "Closed", value: stageCounts.Closed },
      ]);
    });

    // Get leads created per day for time-series chart
    const unsubscribeLeadsPerDay = onSnapshot(leadsRef, (snapshot) => {
      const leadsCountPerDay = {};
      snapshot.forEach((doc) => {
        const lead = doc.data();
        const createdAt = lead.createdAt.toDate(); // assuming there's a createdAt field
        const day = createdAt.toISOString().split("T")[0]; // format as YYYY-MM-DD
        leadsCountPerDay[day] = (leadsCountPerDay[day] || 0) + 1;
      });

      // Convert to an array and sort by date
      const sortedLeads = Object.keys(leadsCountPerDay).map((date) => ({
        date,
        count: leadsCountPerDay[date],
      }));

      setLeadsPerDay(sortedLeads.sort((a, b) => new Date(a.date) - new Date(b.date)));
    });

    // Calculate key metrics: Conversion Rate and Average Time in Stage
    const unsubscribeLeadActivities = onSnapshot(collection(db, "activities", user.uid, "logs"), (activitySnapshot) => {
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
          totalTimeInStage += activity.timeInStage; // assuming timeInStage is logged in the activity
          leadsCount++;
        }
      });

      // Conversion Rate Calculation
      setConversionRate(((totalLeadsClosed / totalLeadsCreated) * 100).toFixed(2));

      // Average Time in Stage Calculation
      setAvgTimeInStage((totalTimeInStage / leadsCount).toFixed(2)); // assuming timeInStage is in days or hours
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeLeadsByStage();
      unsubscribeLeadsPerDay();
      unsubscribeLeadActivities();
    };
  }, [user]);

  return (
    <div className="p-6  min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Analytics Dashboard</h1>

      {/* Funnel Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lead Funnel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Funnel data={leadsByStage} dataKey="value" shape="rectangular">
              <LabelList position="top" fill="#4A4A4A" fontSize={16} dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      {/* Time-Series Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Leads Created per Day</h2>
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
          <p className="text-3xl font-semibold text-blue-600">{conversionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Average Time in Stage (days)</p>
          <p className="text-3xl font-semibold text-blue-600">{avgTimeInStage} days</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
