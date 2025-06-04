// ProblemPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ProblemPage() {
  const [problem, setProblem] = useState([
    { title: 'Two Sum', description: 'Find the sum of two numbers' },
    { title: 'Reverse String', description: 'Reverse the given string' },
    { title: 'Palindrome', description: 'Check if the string is a palindrome' },
    { title: 'Fibonacci', description: 'Generate Fibonacci series' },
    { title: 'Factorial', description: 'Calculate factorial of a number' },
    { title: 'Greatest Common Divisor', description: 'Find the GCD of two numbers' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">
          Problem List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problem.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3 capitalize">{item.title}</h2>
              <p className="text-gray-600 text-sm">{item.description}</p>
              <Link
                to={`/problems/${index}`}
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