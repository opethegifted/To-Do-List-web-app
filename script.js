// Run this when the page loads
window.onload = function () {
  loadTasks();

  // Load dark mode preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeButton.textContent = "☀️ Light Mode";
  }
};

// Drag logic
let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
}

function dragOver(e) {
  e.preventDefault(); // Allow dropping
}

function drop(e) {
  e.preventDefault();
  if (draggedItem !== this) {
    const taskList = document.getElementById("taskList");
    const items = [...taskList.children];
    const draggedIndex = items.indexOf(draggedItem);
    const droppedIndex = items.indexOf(this);

    if (draggedIndex < droppedIndex) {
      taskList.insertBefore(draggedItem, this.nextSibling);
    } else {
      taskList.insertBefore(draggedItem, this);
    }

    updateTasks(); // Save new order
  }
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");

  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  const task = {
    text: taskText,
    dueDate: dueDate,
    priority: priority,
    completed: false
  };

  renderTask(task);
  saveTask(task);

  taskInput.value = "";
  dueDateInput.value = "";
  priorityInput.value = "low";
}

function renderTask(task) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = task.text;

  // Due date
  if (task.dueDate) {
    const dateSpan = document.createElement("span");
    dateSpan.classList.add("due-date");
    dateSpan.textContent = ` (Due: ${task.dueDate})`;
    span.appendChild(dateSpan);
  }

  // Priority
  const priorityTag = document.createElement("span");
  priorityTag.classList.add("priority", task.priority);
  priorityTag.textContent = task.priority.toUpperCase();
  span.appendChild(priorityTag);

  li.appendChild(span);

  if (task.completed) {
    li.classList.add("completed");
  }

  // Enable drag
  li.setAttribute("draggable", "true");
  li.addEventListener("dragstart", dragStart);
  li.addEventListener("dragover", dragOver);
  li.addEventListener("drop", drop);

  // Toggle complete
  li.addEventListener("click", function () {
    li.classList.toggle("completed");
    updateTasks();
  });

  // Delete button
  const deleteBtn = document.createElement("span");
  deleteBtn.textContent = " ❌";
  deleteBtn.classList.add("delete");
  deleteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    li.remove();
    updateTasks();
  });
  li.appendChild(deleteBtn);

  // Edit button
  const editBtn = document.createElement("span");
  editBtn.textContent = " ✏️";
  editBtn.classList.add("edit");
  editBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const newText = prompt("Edit your task:", task.text);
    if (newText !== null && newText.trim() !== "") {
      span.childNodes[0].textContent = newText.trim();
      updateTasks();
    }
  });
  li.appendChild(editBtn);

  document.getElementById("taskList").appendChild(li);
}

function saveTask(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTasks() {
  const listItems = document.querySelectorAll("#taskList li");
  let tasks = [];

  listItems.forEach((li) => {
    const text = li.firstChild.childNodes[0].textContent.trim();
    const dueDateText = li.querySelector(".due-date")?.textContent || "";
    const dueDate = dueDateText ? dueDateText.replace("(Due:", "").replace(")", "").trim() : "";
    const priority = li.querySelector(".priority")?.textContent.toLowerCase() || "low";
    const completed = li.classList.contains("completed");

    tasks.push({ text, dueDate, priority, completed });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => {
    renderTask(task);
  });
}

function filterTasks(status) {
  const listItems = document.querySelectorAll("#taskList li");

  listItems.forEach((li) => {
    const isCompleted = li.classList.contains("completed");

    if (status === "all") {
      li.style.display = "flex";
    } else if (status === "completed") {
      li.style.display = isCompleted ? "flex" : "none";
    } else if (status === "incomplete") {
      li.style.display = !isCompleted ? "flex" : "none";
    }
  });
}

// Dark mode toggle
const themeButton = document.getElementById("themeButton");

themeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeButton.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Export tasks to JSON
function exportTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
