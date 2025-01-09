const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "linkedin";

// Middleware
app.use(express.json());

let db, posts;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        posts = db.collection("posts");

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
app.get('/posts', async (req, res) => {
    try {
        const allPosts = await posts.find().toArray();
        res.status(200).json(allPosts);
    } catch (err) {
        res.status(500).send("Error fetching posts: " + err.message);
    }
});

// GET: fetch a specific post
app.get('/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId; // Get userId from URL params
        const post = await posts.findOne({ postId: postId }); // Query with userId field

        if (!post) {
            return res.status(404).send("Post not found");
        }

        res.status(200).json(post); // Send the found user
    } catch (err) {
        res.status(500).send("Error fetching post: " + err.message);
    }
});

// POST: Add a new post
app.post('/posts', async (req, res) => {
    try {
        const newPost = req.body;
        const result = await posts.insertOne(newPost);
        res.status(201).send(`Post added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding post: " + err.message);
    }
});

// PATCH: update user headline
app.patch('/posts/:postId/likes', async (req, res) => {
    try {
        const postId = (req.params.postId);
        const updates = req.body;
        const result = await posts.updateOne({ postId }, { $set: updates });
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error partially updating post: " + err.message);
    }
});

// DELETE: Remove a post
app.delete('/posts/:postId', async (req, res) => {
    try {
        const postId = (req.params.postId);
        const result = await posts.deleteOne({ postId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting post: " + err.message);
    }
});