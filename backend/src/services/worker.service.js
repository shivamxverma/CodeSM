import axios from "axios";

export const workerService = async () => {
    try {
        const response = await axios.get(`${process.env.WORKER_URL || 'http://localhost:3000'}/api/worker`);
        return response.data;
    } catch (error) {
        console.error("Error fetching worker data:", error);
        throw new Error("Failed to fetch worker data");
    }
}