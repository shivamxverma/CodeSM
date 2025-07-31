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
    tags: "",
    testcases: [{ input: "", output: "" }],
  });

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith("testcaseInput") || name.startsWith("testcaseOutput")) {
      const newTestcases = [...formData.testcases];
      const idx = parseInt(name.split("-")[1]);
      if (name.startsWith("testcaseInput")) {
        newTestcases[idx].input = value;
      } else {
        newTestcases[idx].output = value;
      }
      setFormData({ ...formData, testcases: newTestcases });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addTestcase = () => {
    setFormData({
      ...formData,
      testcases: [...formData.testcases, { input: "", output: "" }],
    });
  };

  const removeTestcase = (index) => {
    if (formData.testcases.length > 1) {
      const newTestcases = formData.testcases.filter((_, i) => i !== index);
      setFormData({ ...formData, testcases: newTestcases });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in formData) {
        if (key === "testcases") {
          data.append(key, JSON.stringify(formData.testcases));
        } else {
          data.append(key, formData[key]);
        }
      }

      const res = await axios.post("http://localhost:8000/api/v1/problem/createproblem", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(res.data.message);

      const url = res.data.message;
      const problemName = formData.title.toLowerCase().replace(/\s+/g, '');
      console.log("Upload URL:", problemName);
      const testcasesFile = new Blob([JSON.stringify(formData.testcases)], { type: "application/json" });
      const uploadRes = await axios.put(url, testcasesFile, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Testcases uploaded successfully:", uploadRes.data);

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
          <label className="block text-lg text-gray-700 mb-2">Testcases</label>
          {formData.testcases.map((testcase, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-xl">
              <div>
                <label className="block text-md text-gray-600">
                  Testcase {index + 1} Input
                </label>
                <textarea
                  name={`testcaseInput-${index}`}
                  value={testcase.input}
                  onChange={(e) => handleChange(e, index)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-xl mb-2"
                  required
                />
              </div>
              <div>
                <label className="block text-md text-gray-600">
                  Testcase {index + 1} Output
                </label>
                <textarea
                  name={`testcaseOutput-${index}`}
                  value={testcase.output}
                  onChange={(e) => handleChange(e, index)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-xl"
                  required
                />
              </div>
              {formData.testcases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTestcase(index)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition"
                >
                  Remove Testcase
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTestcase}
            className="mt-2 px-4 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition"
          >
            + Add Testcase
          </button>
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