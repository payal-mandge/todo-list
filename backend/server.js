const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

//mongodb connection
mongoose
.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Mongodb Connected"))
.catch((err) => console.error("Mongodb connection error:", err));

//schema
 const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
 });

 const Task = mongoose.model("Task", taskSchema);

 //routes

 //add new task
 app.post("/api/tasks", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Task text cannot be empty" });
    }
    const newTask = new Task({ text });
    await newTask.save();
    res.status(201).json(newTask);
  }catch (err) {
    res.status(500).json({ error: "Failed to save task" });
  }
 });

 //get all tasks
 app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  }catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
 });

//toggle task complition
app.put("/api/tasks/:id", async (req, res) => {
  try {
    //find the task and update
    const updated = await Task.findByIdAndUpdate(
      req.params.id, 
      { completed: req.body.completed },
      { new: true }
    );
    res.json(updated);
  }catch (err) {
    res.status(500).json({ error: "Failed to update task" });
    }
});

//delete the task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ messsage: "Task deleted successfully" });
  }catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

 app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));