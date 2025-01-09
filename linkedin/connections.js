const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "linkedin";

// Middleware
app.use(express.json());

let db, connections;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        connections = db.collection("connections");

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

// GET: List all connections for a specific user
app.get('/connections/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from the route parameter
        
        // Query to find connections where userId is either user1 or user2
        const userConnections = await connections.find({
            $or: [{ user1: userId }, { user2: userId }]
        }).toArray();

        if (userConnections.length === 0) {
            return res.status(404).send("No connections found for this user.");
        }

        res.status(200).json(userConnections); // Return the list of connections
    } catch (err) {
        res.status(500).send("Error fetching connections: " + err.message);
    }
});


// POST: Add a new connections
app.post('/connections', async (req, res) => {
    try {
        const newUser = req.body;
        const result = await connections.insertOne(newUser);
        res.status(201).send(`connections added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding connections: " + err.message);
    }
});

// PATCH: update user headline
app.patch('/connections/:connectionId', async (req, res) => {
    try {
        const connectionId = (req.params.connectionId);
        const updates = req.body;
        const result = await connections.updateOne({ connectionId }, { $set: updates });
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error updating connections: " + err.message);
    }
});

// DELETE: Remove a connections
app.delete('/connections/:connectionId', async (req, res) => {
    try {
        const connectionId = (req.params.connectionId);
        const result = await connections.deleteOne({ connectionId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting connections: " + err.message);
    }
});