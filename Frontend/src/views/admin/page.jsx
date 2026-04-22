import React,{useEffect, useState} from "react";
import { getAllRequest } from "@/api/api";

const AdminDashboard = () => {
    const [Request,SetRequest] = useState([]);

    useEffect(() => {
        async function fetchAllRequest(){
            const response = await getAllRequest();
            SetRequest(response.data.message || []);
        }
        fetchAllRequest();
    },[])

    return (
        <>
        <h1>Admin Dashboard</h1>
        <div>Hey</div>
        </>
    );
}

export default AdminDashboard;