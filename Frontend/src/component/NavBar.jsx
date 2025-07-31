import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function NewNav() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold tracking-tight">CodeSM</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/problems"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200"
              >
                Problems
              </Link>
              <button className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200">
                <Link to="/newproblem">Create Problem</Link>
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200">
                Learn
              </button>
              <div className="relative">
                <Link
                  to="/profile"
                  className="flex items-center rounded-full text-sm font-medium hover:bg-blue-500 transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
              {/* <div className="absolute right-20 mt-2 w-20 bg-white rounded-md shadow-lg text-gray-500 z-7">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 transition-colors duration-200"
                    >
                      Logout
                    </button>
              </div> */}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NewNav;