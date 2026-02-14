
// SIMPLE STUDENT MANAGEMENT BACKEND
// Node.js + Express + MongoDB


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;


// MIDDLEWARE

app.use(cors());
app.use(express.json());


// MONGODB CONNECTION

// Connect to MongoDB (local installation)
mongoose.connect('mongodb://localhost:27017/student_management', {

    useNewUrlParser: true,
    useUnifiedTopology: true

})

.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('❌ MongoDB connection error:', err));


// STUDENT SCHEMA mongodb (Database Structure)

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Student Model
const Student = mongoose.model('Student', studentSchema);

// API ROUTES (CRUD Operations)


// 1. CREATE Add new student
app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            data: student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding student',
            error: error.message
        });
    }
});

// 2.Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
});

// 3.Get single student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: error.message
        });
    }
});

// 4. Update student by ID
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        res.status(400).json({
            success: false,

            message: 'Error updating student',
            error: error.message
        });
    }
});

// 5. Delete student by ID
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,

                message: 'Student not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
});

// Search students
app.get('/api/students/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const students = await Student.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { course: { $regex: query, $options: 'i' } },
                { year: { $regex: query, $options: 'i' } }

            ]
        });
        res.status(200).json({

            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching students',
            error: error.message
        });
    }
});

//  route
app.get('/', (req, res) => {
    res.json({
        message: 'Student Management API',
        version: '1.0',
        endpoints: {
            'GET /api/students': 'Get all students',
            'GET /api/students/:id': 'Get single student',
            'POST /api/students': 'Add new student',
            'PUT /api/students/:id': 'Update student',
            'DELETE /api/students/:id': 'Delete student',
            'GET /api/students/search/:query': 'Search students'
        }
    });
});

// START SERVER

app.listen(PORT, () => {
  
    console.log(` Server is  running on  http://localhost:${PORT}`);
  
       console.log(`API is readyy at http://localhost:${PORT}/api/students`);
});
