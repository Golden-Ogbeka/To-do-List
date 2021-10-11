require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const server = express();

server.use(cors()); //To enable cross origin resource sharing
server.use(express.json()); //To be able to accept input from front-end

// Database URL with name of Database
let DB_URL = process.env.MONGO_URI;

// Initial Database connection
try {
	MongoClient.connect(DB_URL, (err, db) => {
		if (err) throw err;
		console.log('Database connected!');
		db.close();
	});
} catch (error) {
	console.log("Couldn't connect to DB");
}

// Routes

// Get Tasks
server.get('/api/tasks', async (req, res) => {
	try {
		MongoClient.connect(DB_URL, (err, dbConnect) => {
			if (err) throw err;
			var db = dbConnect.db('Todo');
			db
				.collection('tasks')
				.find({})
				.toArray(function (err, result) {
					if (err) throw err;
					dbConnect.close();
					return res.send(result);
				});
		});
	} catch (error) {
		return res.status(500).send("Couldn't retrieve tasks");
	}
});

// Add Task
server.post('/api/task', async (req, res) => {
	try {
		const { title, content } = req.body;
		MongoClient.connect(DB_URL, (err, dbConnect) => {
			if (err) throw err;
			var db = dbConnect.db('Todo');
			db.collection('tasks').insertOne(
				{
					title: title,
					content: content,
				},
				(err, result) => {
					if (err) throw err;
					dbConnect.close();
					return res.send(result.insertedId);
				},
			);
		});
	} catch (error) {
		return res.status(500).send("Couldn't add task");
	}
});

// Delete Task
server.delete('/api/task', async (req, res) => {
	try {
		let { taskID } = req.query;

		// Convert ID to ObjectID for MongoDb to recognize it
		taskID = ObjectId(taskID);

		MongoClient.connect(DB_URL, (err, dbConnect) => {
			if (err) throw err;
			var db = dbConnect.db('Todo');
			db.collection('tasks').deleteOne({ _id: taskID }, (err, obj) => {
				if (err) throw err;
				dbConnect.close();
				return res.send('Task Deleted');
			});
		});
	} catch (error) {
		return res.status(500).send("Couldn't delete task");
	}
});

// View client
server.use(async function (req, res) {
	res.sendFile(path.join(__dirname, 'client', '/build/index.html'));
});
// Server initialization on port 5000
server.listen(process.env.PORT || 5000, () => {
	console.log(`Server Started on port ${process.env.PORT || 5000}`);
});
