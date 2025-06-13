import React, { useState } from "react";
import axios from "axios";

function CreateProblem() {
  const [formData, setFormData] = useState({
    title: "",
    difficulty: 800,
    description: "",
    memoryLimit: "",
    timeLimit: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    constraints: "",
    tags: [],
    testcases: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }

      // console.log(data);

      const res = await axios.post("http://localhost:8000/api/v1/problem/createproblem", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // console.log(res.data);

      alert("Problem created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create problem.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Create New Problem
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { label: "Title", name: "title", type: "text" },
          { label: "Memory Limit (MB)", name: "memoryLimit", type: "number" },
          { label: "Time Limit (s)", name: "timeLimit", type: "number" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-lg text-gray-700">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-lg text-gray-700">
            Difficulty (800–3000)
          </label>
          <input
            type="number"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            min={800}
            max={3000}
            className="w-full p-3 border border-gray-300 rounded-xl"
            placeholder="e.g., 1200"
            required
          />
        </div>

        {[
          { label: "Description", name: "description" },
          { label: "Input Format", name: "inputFormat" },
          { label: "Output Format", name: "outputFormat" },
          { label: "Sample Input", name: "sampleInput" },
          { label: "Sample Output", name: "sampleOutput" },
          { label: "Constraints", name: "constraints" },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block text-lg text-gray-700">{label}</label>
            <textarea
              name={name}
              value={formData[name]}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-lg text-gray-700">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            placeholder="math, binary search, dp"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="block text-lg text-gray-700 mb-2">
            Upload Testcases File (.txt)
          </label>
          <input
            type="file"
            name="testcases"
            accept=".txt"
            onChange={handleChange}
            className="file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0 file:text-sm file:font-semibold
              file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            required
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition w-full"
        >
          Submit Problem
        </button>
      </form>
    </div>
  );
}

export default CreateProblem;
