import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-3 px-6 flex justify-between items-center rounded-b-2xl border-b-4 border-blue-500">
      <div className="flex items-center space-x-3">
        <img
          src="/logo.png"
          alt="Website Logo"
          className="w-10 h-10 rounded-full shadow-md hover:scale-105 transition-transform duration-300"
        />
        <h1 className="text-xl font-bold text-blue-600 tracking-wide hover:text-blue-800 transition-colors duration-300">
          CodeCrush
        </h1>
      </div>

      <div className="relative group">
        <img
          src="/user-avatar.jpg"
          alt="User"
          className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-sm cursor-pointer hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg p-4 hidden group-hover:block z-10">
          <p className="font-semibold text-gray-700">Shivam Kumar</p>
          <button className="mt-2 w-full bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
