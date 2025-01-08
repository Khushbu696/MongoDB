const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "codinggita";

// Middleware
app.use(express.json());

let db, courses;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        courses = db.collection("courses");

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Database
initializeDatabase();

// GET: List all courses by course id
app.get('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        console.log("Querying for courseId:", courseId); // Log the courseId being queried

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).send("Invalid course ID format");
        }

        const course = await courses.findOne({ _id: new ObjectId(courseId) });
        console.log("Course found:", course);

        if (!course) {
            return res.status(404).send("Course not found");
        }

        return res.status(200).json(course);
    } catch (err) {
        console.error("Error:", err.stack); // Log the full error stack
        return res.status(500).send("Error fetching course: " + (err.message || err));
    }
});

//POST: add a new course
app.post('/courses', async (req, res) => {
    try {
        const courseId = req.params.id;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID format" });
        }

        const { courseCode, courseName, credits, instructor } = req.body;

        if (!courseCode || !courseName || !credits || !instructor) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newCourse = {
            courseCode,
            courseName,
            credits,
            instructor
        };

        const result = await courses.insertOne(newCourse);

        return res.status(201).json({ success: true, message: "Course created", data: result.ops[0] });
    } catch (err) {
        console.error("Error creating course:", err.stack);
        return res.status(500).json({ success: false, message: "Error creating course", error: err.message });
    }
});

//PUT: update a course completely
app.put('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID format" });
        }

        const { courseCode, courseName, credits, instructor } = req.body;

        if (!courseCode || !courseName || !credits || !instructor) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const updatedCourse = {
            courseCode,
            courseName,
            credits,
            instructor
        };

        const result = await courses.replaceOne({ _id: new ObjectId(courseId) }, updatedCourse);

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.status(200).json({ success: true, message: "Course replaced successfully" });
    } catch (err) {
        console.error("Error replacing course:", err.stack);
        return res.status(500).json({ success: false, message: "Error replacing course", error: err.message });
    }
});

//PATCH: partially update a course
app.patch('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID format" });
        }

        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No updates provided" });
        }

        const result = await courses.updateOne(
            { _id: new ObjectId(courseId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.status(200).json({ success: true, message: "Course updated successfully" });
    } catch (err) {
        console.error("Error updating course:", err.stack);
        return res.status(500).json({ success: false, message: "Error updating course", error: err.message });
    }
});

//DELETE: delete a course
app.delete('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID format" });
        }

        const result = await courses.deleteOne({ _id: new ObjectId(courseId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (err) {
        console.error("Error deleting course:", err.stack);
        return res.status(500).json({ success: false, message: "Error deleting course", error: err.message });
    }
});