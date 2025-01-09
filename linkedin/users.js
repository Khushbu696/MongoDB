const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "linkedin";

// Middleware
app.use(express.json());

let db, users;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");

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

// GET: List all users
app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});

// GET: List a specific user
app.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL params
        const user = await users.findOne({ userId: userId }); // Query with userId field

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(user); // Send the found user
    } catch (err) {
        res.status(500).send("Error fetching user: " + err.message);
    }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = req.body;
        const result = await users.insertOne(newUser);
        res.status(201).send(`User added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding user: " + err.message);
    }
});

// PATCH: update user headline
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = (req.params.userId);
        const updates = req.body;
        const result = await users.updateOne({ userId }, { $set: updates });
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error partially updating user: " + err.message);
    }
});

// DELETE: Remove a user
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = (req.params.userId);
        const result = await users.deleteOne({ userId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});

/* ------------------------------------------------------------------------------------------ */

// GET: Fetch profile views count
app.get('/users/:userId/profile-views', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await users.findOne({ userId: userId }, { projection: { profileViews: 1, _id: 0 } });

        if (!user) {
            return res.status(404).send("User not found.");
        }

        res.status(200).json({ profileViews: user.profileViews });
    } catch (err) {
        res.status(500).send("Error fetching profile views: " + err.message);
    }
});

// PUT: Add a skill to user
app.put('/users/:userId/skills', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { skills } = req.body;

        if (!skills) {
            return res.status(400).send("Skills is required.");
        }

        const result = await users.updateOne(
            { userId: userId },
            { $push: { skills: skills } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found.");
        }

        res.status(200).send("Skill added successfully.");
    } catch (err) {
        res.status(500).send("Error adding skill: " + err.message);
    }
});

// PATCH: Upgrade to premium account
app.patch('/users/:userId/premium', async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await users.updateOne(
            { userId: userId },
            { $set: { isPremium: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found.");
        }

        res.status(200).send("User upgraded to premium account successfully.");
    } catch (err) {
        res.status(500).send("Error upgrading user to premium account: " + err.message);
    }
});
