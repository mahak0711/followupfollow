"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function LeadFormModal({ onClose }) {
  const [user] = useAuthState(auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
    followUpDate: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);  // To track loading state
  const [success, setSuccess] = useState(false);  // To track submission success

  const validate = () => {
    let errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      await addDoc(collection(db, "leads", user.uid, "items"), {
        ...form,
        status: "New",
        createdAt: serverTimestamp(),
      });
      setForm({
        name: "",
        email: "",
        company: "",
        notes: "",
        followUpDate: "",
      });  // Clear the form fields
      setSuccess(true);  // Indicate successful submission
      onClose();  // Close the modal
    } catch (err) {
      alert("Failed to submit lead.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        {/* Cross button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-stone-800 mb-4">Add New Lead</h2>

        {/* Success Message */}
        {success && <p className="text-green-500 mb-4">Lead added successfully!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "email", "company", "notes", "followUpDate"].map((field) => (
            <div key={field}>
              <input
                type={field === "followUpDate" ? "date" : "text"}
                placeholder={field[0].toUpperCase() + field.slice(1)}
                className="w-full text-stone-500 border rounded px-3 py-2"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
              {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
            </div>
          ))}
          <div className="flex justify-between">
            <button
              type="button"
              className="px-4 py-2 bg-blue-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded"
              disabled={loading}  // Disable the button while loading
            >
              {loading ? "Adding..." : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
