import { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Track the task being edited

  const handleInputChange = (e) => {
    setTaskInput(e.target.value);
  };

  const handleSubmit = async () => {
    if (taskInput.trim() !== "") {
      try {
        const response = await fetch("http://localhost:3000/add-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ todo: taskInput }),
        });
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        const json = await response.json();
        setTasks([...tasks, json.task]);
        setMessage(json.message);
        setTaskInput("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/delete-task/${taskId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      getTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTasks = async () => {
    try {
      const response = await fetch("http://localhost:3000/");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const json = await response.json();
      setTasks(json);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  const handlePencilClick = (task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTask(null);
  };

  const handleSaveEditedTask = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/update-task/${selectedTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedTask),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      // Update tasks state with the edited task
      getTasks();
      setOpen(false); // Close dialog after saving
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center justify-center">
      <h1 className="text-3xl font-bold underline">Todo App</h1>
      {message && <p className="text-green-600">{message}</p>}
      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={taskInput}
            onChange={handleInputChange}
            placeholder="Enter task"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Add Task
          </button>
        </div>
        <div className="mt-4">
          {tasks.map((task) => (
            <div className="flex items-center justify-between" key={task.id}>
              <div className="flex items-center justify-between w-4/5 border border-gray-300 rounded px-3 py-2 mt-2">
                <div>{task.todo}</div>
                <button
                  className="text-red-600"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  &#x2715;
                </button>
              </div>
              <button onClick={() => handlePencilClick(task)}>&#x270F;</button>
            </div>
          ))}
        </div>
        {/* Dialog for editing task */}
        {selectedTask && (
          <dialog open={open} className="dialog">
            <div className="dialog-backdrop"></div>
            <div className="dialog-content">
              <input
                type="text"
                value={selectedTask.todo}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, todo: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-center mt-3">
                <button
                  onClick={handleSaveEditedTask}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={handleCloseDialog}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ml-2"
                >
                  Close
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default App;
