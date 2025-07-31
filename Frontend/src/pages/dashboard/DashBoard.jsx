import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import HeroSectionOne from "@/components/hero-section-demo-1";
import { SparklesCore } from "@/components/ui/sparkles";
// import Cookies from 'js-cookie';

function DashBoard(){
    
    return(
        <>
          <div>
            {/* <h1 className="text-2xl font-bold mb-4 text-center">Welcome to the Dashboard</h1> */}
            <div className="flex justify-center items-center h-screen">
              <h1 className="text-4xl font-bold text-gray-800">Welcome to the Dashboard</h1>
            </div>
            <div className="mt-4"> {/* Added this div for spacing */} </div>
            <div className="flex justify-center space-x-4">
              <Link to="/problems" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Problems</Link>
              <Link to="/newproblem" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add New Problem</Link>
            </div>
            <div className="mt-4">
              {/* <p className="text-gray-700">Here you can manage your problems and add new ones.</p> */}
            </div>
          </div>
        </>
    );
}

export default  DashBoard;