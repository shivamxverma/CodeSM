import mongoose from "mongoose";

const ContestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    problems: [{
        problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
        points: { type: Number, default: 100 },
        index: { type: String, default: "" }
    }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

ContestSchema.virtual("endTime").get(function () {
    return new Date(this.startTime.getTime() + this.durationMinutes * 60 * 1000);
});

export default mongoose.model("Contest", ContestSchema);
