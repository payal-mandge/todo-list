import React, { useState, useRef, useEffect } from "react"; //react hooks
import { FaEllipsisV, FaEdit, FaEyeSlash, FaTrash } from "react-icons/fa";
import "./App.css";


function App() {
//state to store list of tasks
const [tasks, setTasks] = useState([]);

//state to store new task text
const [newTask, setNewTask] = useState("");

//ref for input box (so we can refocus it)
const inputRef = useRef(null);

//state for menu visibility
const [menuOpen, setMenuOpen] = useState(false);

//state for hiding completed tasks
const [hideCompleted, setHideCompleted] = useState(false);

//state for edit mode
const [editMode, setEditMode] = useState(false);

//track selected task for deletion
const [selectedTasks, setSelectedTasks] = useState([]);

//reference for menu container
const menuRef = useRef(null);

const API_URL = "https://todo-list-2-i4b4.onrender.com/api/tasks";

//fetch tasks from backened when app loads
useEffect(() => {
  fetch(`${API_URL}`)
    .then(res => res.json())
    .then(data => setTasks(data))
    .catch(err => console.log("Error fetching tasks:", err));
}, []);

//add new task to backend

const addTask = async (e) => {
  e.preventDefault();
  if (newTask.trim() === "") return;

  try {
    await fetch(`${API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTask }),
    });

    // fetch sorted list again
    const res = await fetch(`${API_URL}`);
    const sortedTasks = await res.json();
    setTasks(sortedTasks);

    setNewTask("");
    inputRef.current?.focus();
  } catch (err) {
    console.log("Error adding task:", err);
  }
};

 
//toggle task completion
const toggleTask = async (id, completed) => {
  try {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !completed }),
  });
  const updated = await res.json();

  //After update ->fetch fresh sorted list from backend
  const tasksRes = await fetch(`${API_URL}`);
  const sortedTasks = await tasksRes.json();
  
  setTasks(sortedTasks);

}catch (err) {
  console.error("Error updating task:", err);
}
}; 

//filter tasks if hide completed is true
const sorted = [...tasks].sort((a, b) => {
  if (a.completed === b.completed) return 0;
  return a.completed ? 1 : -1; //completed goes last
});
const visibleTasks = hideCompleted ? sorted.filter(task => !task.completed) : sorted;

//toggle edit mode
const handleEditToggle = () => {
  setEditMode(!editMode);
  setMenuOpen(false);
  setSelectedTasks([]); //clear previous selections
};

//select/ unselect tasks for deletion
const handleTaskSelect = (taskId) => {
  if (selectedTasks.includes(taskId)) {
    setSelectedTasks(selectedTasks.filter(id => id !== taskId));
  } else {
    setSelectedTasks([...selectedTasks, taskId]);
  }
};


//delete selected tasks
const deleteTask = async (id) => {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    //remove from ui
    setTasks(tasks.filter((t) => t._id !== id));
  }catch (err) {
    console.error("Error deleting task:", err);
  }
};

//close menu if clicked outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)){ setMenuOpen(false);

    }
  };
  if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [menuOpen]);

return(

<div className="container">

{/*show edit controls when in edit mode */}
  {editMode && (
    <div className="edit-controls">
      <button className="cancel-btn" onClick={() => setEditMode(false)}>
        cancel
      </button>

      <button 
        className="selectall-btn"
        onClick={() => {
          if (selectedTasks.length === visibleTasks.length) {
            setSelectedTasks([]); //deselect all
          } else {
            setSelectedTasks(visibleTasks.map(task => task._id));
 //select all visible
          }
        }}
      >
        {selectedTasks.length === visibleTasks.length ? "Deselect All" : "Select All"}
      </button>
    </div>
  )}

  {/* header with 3 dot menu  above title*/}
  <div className="header">

    {/*hide menu button while in edit mode */}
    {!editMode && (


  <div className="menu-container" ref={menuRef}>
    {/* keep space reserved but hide the menu button visually when in edit mode  */}
    <button 
        className="menu-button" 
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ visibility: editMode ? "hidden" : "visible" }}
        >
      <FaEllipsisV 
          size={18} 
          color="#444"  
          style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" }} />
    </button>

    {!editMode && menuOpen && (
      <div className="dropdown-menu">
        <button onClick={handleEditToggle}>
          <FaEdit /> {editMode ? "Exit Edit Mode" : "Edit"}
        </button>

        <button onClick={() => { 
          setHideCompleted(!hideCompleted);
        setMenuOpen(false);
       }}
      >
        <FaEyeSlash /> {hideCompleted ? "show completed" : "Hide completed"}
      </button>
      </div>
    )}
  </div>
    )}

    {/*remove title when in edit mode  */}

    {!editMode && (
   <h1>To-Do </h1>
    )}
  </div>
  

{!editMode && (
  <div className="input-area">

    <input
    ref={inputRef} 
    type="text"
    placeholder="Enter a new task"
    value={newTask}
    onChange={(e) => setNewTask(e.target.value)} // event handler
    onKeyDown={(e) => e.key === "Enter" && addTask(e)} //press enter to add 
    />
    <button onClick={addTask}>Add</button>
  </div>
  )}

  <ul className="task-list">
    {visibleTasks.map((task, index) => (
      <li key={task._id} className={task.completed ? "completed" : ""}>
        
        <div className="task-item">
          {/*left: checkbox for completion (only visible in edit mode) */}
    {!editMode && (
      <div className="checkbox-wrapper">
        <input 
        type="checkbox"
        checked={task.completed} 
        onChange={() => toggleTask(task._id, task.completed)} 
        />
      </div>
     )}

     {/*center: task text */}
      <span className="task-text">{task.text}</span>

      {/* delete button on right */}
      {!editMode && (
      <button 
        className="row-delete-btn"
        onClick={() => deleteTask(task._id)}
        title="Delete task">
          <FaTrash />
            </button>
      )} 

{/*right:  checkbox for selecting tasks only in edit mode */}
      {editMode && (
        <div className="select-delete"
        >
        <input 
        type="checkbox"
        checked={selectedTasks.includes(task._id)}
        onChange={() => handleTaskSelect(task._id)} 
        />
        </div>
      )}
      </div>
      </li>
    
    ))}
  </ul>

  {/*bottom delete button (only visible in edit mode) */}
    {editMode && selectedTasks.length > 0 && (
      <div className="delete-bar show">
        <button 
          className="delete-btn"
          onClick={async () => {
  
  try {
    //delete each selected task (by task id)

  for (let taskId of selectedTasks) {
    await deleteTask(taskId);
  }
  //refresh tasks after deletion
  const res = await fetch(API_URL);
  const updatedTasks = await res.json();
  setTasks(updatedTasks);

  //clear selection
  setSelectedTasks([]); // reset selection
}catch (err) {
  console.error("Bulk delete failed:", err);
}
          }}

   >
<FaTrash />
          </button>
        </div>
    )}

</div>
);

}

export default App;