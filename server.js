// SIMPLE STUDENT MANAGEMENT BACKEND
// Node + Express + MongoDB

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// IMPORTANT for Render deployment
const PORT = process.env.PORT || 3000;


// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// serve frontend files
app.use(express.static(__dirname));

// open main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index-database.html"));
});


// =======================
// MONGODB CONNECTION
// =======================

// ❗ CHANGE THIS TO MONGODB ATLAS URL (cloud database)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));


// =======================
// SCHEMA
// =======================
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    course: String,
    year: String,
    createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", studentSchema);


// =======================
// CRUD ROUTES
// =======================

app.post("/api/students", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({ success: true, data: student });
    } catch (err) {
        res.json({ success: false, message: "Add failed" });
    }
});

app.get("/api/students", async (req, res) => {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
});

app.put("/api/students/:id", async (req, res) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: student });
});

app.delete("/api/students/:id", async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});


// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
