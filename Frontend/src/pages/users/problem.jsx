import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ProblemPage() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/problem');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data.message); 
        setProblems(Array.isArray(data.message) ? data.message : []);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]); 
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">
          Problem List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item) => (
            <div
              key={item._id} // Use _id as the unique key
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3 capitalize">{item.title}</h2>
              <p className="text-gray-600 text-sm">Difficulty: {item.difficulty}</p>
              <Link
                to={`/problems/${item._id}`} // Use _id for routing
                className="mt-4 inline-block text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
              >
                Solve Now →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;