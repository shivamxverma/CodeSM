import React,{useState,useEffect} from "react";
import NewNav from "../../component/NewNav";
import { Link } from 'react-router-dom';

function DashBoardTest(){
    return(
        <>
          {/* <NewNav/> */}
          <div>
            <h1 className="text-2xl font-bold mb-4 text-center">Welcome to the Dashboard</h1>
            <div className="flex justify-center space-x-4">
              <Link to="/problems" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Problems</Link>
              <Link to="/new_problem" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add New Problem</Link>
            </div>
            <div className="mt-4">
              <p className="text-gray-700">Here you can manage your problems and add new ones.</p>
            </div>
          </div>
        </>
    );
}

export default  DashBoardTest;