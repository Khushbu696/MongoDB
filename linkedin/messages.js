const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "linkedin";

// Middleware
app.use(express.json());

let db, messages;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        messages = db.collection("messages");

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

// GET: List a specific message
app.get('/messages/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from the URL parameter

        // Query to find messages where the user is either the sender or the recipient
        const userMessages = await messages.find({
            $or: [{ from: userId }, { to: userId }]
        }).toArray();

        if (userMessages.length === 0) {
            return res.status(404).send("No messages found for this user.");
        }

        res.status(200).json(userMessages); // Return the list of messages
    } catch (err) {
        res.status(500).send("Error fetching messages: " + err.message);
    }
});


// POST: Add a new user
app.post('/messages', async (req, res) => {
    try {
        const newMessage = req.body;
        const result = await messages.insertOne(newMessage);
        res.status(201).send(`Message added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding message: " + err.message);
    }
});

// DELETE: Remove a user
app.delete('/messages/:messageId', async (req, res) => {
    try {
        const messageId = (req.params.messageId);
        const result = await messages.deleteOne({ messageId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting message: " + err.message);
    }
});