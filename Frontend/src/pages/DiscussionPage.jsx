import React, { useEffect, useState } from 'react';
import { getAllDiscussion, createDiscussion } from '@/api/api';

// Reusable Field wrapper for form inputs
const Field = ({ label, hint, children }) => (
  <div className="mb-4">
    <div className="mb-1 flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const DiscussionPage = () => {
  const [discussion, setDiscussion] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", tags: "" });

  // Update form fields
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch all discussions on mount
  useEffect(() => {
    async function fetchDiscussion() {
      try {
        const response = await getAllDiscussion();
        setDiscussion(response.data.message); // adjust based on backend response shape
      } catch (error) {
        console.error("Error fetching discussions:", error);
      }
    }
    fetchDiscussion();
  }, []);

  // Handle new discussion creation
  const handleDiscussionCreation = async (e) => {
    e.preventDefault();
    try {
      const response = await createDiscussion(formData);
      setDiscussion(prev => [...prev, response.data]); // append new discussion
      setFormData({ title: "", description: "", tags: "" }); // reset form
    } catch (error) {
      console.error("Error creating discussion:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Discussion Board</h1>

      {/* Form */}
      <form onSubmit={handleDiscussionCreation} className="space-y-4 mb-8 bg-white shadow-md rounded-lg p-6">
        <Field label="Title">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Enter Title For Discussion"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Give the Description"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </Field>

        <Field label="Tags" hint="Comma separated">
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            placeholder="e.g. algorithms, interview"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </Field>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700 transition"
        >
          + Create Discussion
        </button>
      </form>

      {/* Discussion List */}
      <div className="space-y-4">
        {discussion.length === 0 ? (
          <p className="text-gray-500">No discussions yet. Be the first to start one!</p>
        ) : (
          discussion.map(dis => (
            <div key={dis._id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
              <h2 className="text-lg font-semibold text-gray-800">{dis.title}</h2>
              <p className="text-gray-600 mt-2">{dis.description}</p>
              <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                <span>
                  {dis.tags?.split(',').map(tag => (
                    <span
                      key={tag}
                      className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mr-2"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </span>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1">👍 {dis.like}</span>
                  <span className="flex items-center gap-1">👎 {dis.dislike}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;
