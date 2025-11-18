import connectDB from "./config/db.config.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path : "./env"
});

connectDB()

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})

.catch(err => {
    console.error("Error Connecting to MongoDB:", err);
    process.exit(1);
})
