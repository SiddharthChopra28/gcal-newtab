async function putDates(){
    const _dates = await fetch("http://localhost:3000/api/getCurrent35", {
        method: 'GET', 
        headers: {
            "Content-Type": "application/json",
        }
    })
     
    dates_json = await _dates.json()
    console.log(dates_json)

    const now = new Date()
    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric'});
    document.getElementById("header").innerText = monthName
    console.log(monthName)

    let datesndays = dates_json.daysOfCal.map((string)=>{
        const d = new Date(string)
        return [d.getDate(), d.toLocaleDateString('en-US', { weekday: 'long' })]
    })
    globalThis.currentMonthDates = {dates: dates_json.daysOfCal.map((string)=>{
        return new Date(string);
    }), ids: [], events: []
    }

    let counter = 0;
    for (let i=1; i<=5; i++){
        for (let j=1; j<=7; j++){
            document.getElementById(`day${i}-${j}`).getElementsByClassName("date")[0].innerText = datesndays[counter][0];
            document.getElementById(`day${i}-${j}`).getElementsByClassName("day")[0].innerText = datesndays[counter][1];
            globalThis.currentMonthDates.ids.push(`day${i}-${j}`);
            globalThis.currentMonthDates.events.push([])
            counter++;
        }   
    }
}

function checkIntersection(range, day) {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    let result = (
        new Date(range.start.date) <= endOfDay &&
        new Date(range.end.date) >= startOfDay
      );
      if (result){
        console.log("*****")
        console.log(new Date(range.start.date))
        console.log(startOfDay)
        console.log('...')
        console.log(endOfDay)
        console.log(new Date(range.end.date))
        console.log("*****")
        
    }
    return result;
  }
  
function addEventToCalendar(e){
    for (let x = 0; x < globalThis.currentMonthDates.dates.length; x++){
        if (checkIntersection(e, globalThis.currentMonthDates.dates[x])){
            console.log('truree')
            globalThis.currentMonthDates.events[x].push(e);
            let l = globalThis.currentMonthDates.events[x].length;
            let onedot = '<div class=\"dot\"> </div>'
            document.getElementById(globalThis.currentMonthDates.ids[x]).getElementsByClassName("eventdots")[0].innerHTML = onedot.repeat(l);
            return;
        }
    }
}

async function putEvents(){

    chrome.identity.getAuthToken({interactive: true}, async (token)=> {
        // if on brave, need to enable google login for extensions in settings
        console.log(token);
        
        const events = await fetch("http://localhost:3000/api/getEvents", {
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({token:token})
    
        })
         
        let events_json = await events.json()

        for (let calindex in events_json){
            for (e of events_json[calindex].items){
                let startDate = new Date(e.start)
                let endDate = new Date (e.end)

                addEventToCalendar(e);
                
            }
        }
        console.log(globalThis.currentMonthDates)

        
    });


}
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

    const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' }); 
    const date = now.toLocaleDateString('en-GB'); 
    
    const final = `${weekday}, ${date}`;

    document.getElementById("time").innerText = timeString;
    document.getElementById("date").innerText = final;

  }
  
  
window.onload = ()=> {
    putDates();
    putEvents();
    setInterval(updateClock, 1000); 
    updateClock();
  
};
  
const pageContent = document.getElementById('mainpage');
const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelButton');
const addTaskBtn = document.getElementById('addTaskButton');
const taskForm = document.getElementById('taskForm');
const taskListContainer = document.getElementById('taskListContainer');
const formTitle = document.getElementById('formTitle');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const saveTaskButton = document.getElementById('saveTaskButton');
const cancelFormButton = document.getElementById('cancelFormButton');

// Sample tasks data
let tasks = [
    { id: 1, title: 'Complete project proposal', description: 'Finish the draft and send it to the client' },
    { id: 2, title: 'Schedule meeting', description: 'Book a conference room for the team meeting' },
    { id: 3, title: 'Research new tools', description: 'Look for project management tools that can help streamline our workflow' }
];

// Current edit state
let currentEditId = null;

// Function to open modal
function openModal() {
    modalOverlay.classList.add('active');
    pageContent.classList.add('blurred');
    renderTasks();
}

// Function to close modal
function closeModal() {
    modalOverlay.classList.remove('active');
    pageContent.classList.remove('blurred');
    hideTaskForm();
}

// Function to render tasks
function renderTasks() {
    if (tasks.length === 0) {
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <h3>No tasks yet</h3>
                <p>Get started by adding your first task!</p>
                <button class="modal-button add-task-button" onclick="showAddTaskForm()">Add Your First Task</button>
            </div>
        `;
        return;
    }

    const taskListHtml = `
        <ul class="task-list">
            ${tasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}">
                    <div class="task-content">
                        <h3 class="task-title">${task.title}</h3>
                        <p class="task-description">${task.description}</p>
                    </div>
                    <div class="task-actions">
                        <button class="task-button complete-button" onclick="toggleTaskStatus(${task.id})" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                            ${task.completed ? '↩' : '✓'}
                        </button>
                        <button class="task-button edit-button" onclick="editTask(${task.id})" title="Edit task">✎</button>
                        <button class="task-button delete-button" onclick="deleteTask(${task.id})" title="Delete task">✕</button>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
    
    taskListContainer.innerHTML = taskListHtml;
}

// Show add task form
function showAddTaskForm() {
    formTitle.textContent = 'Add New Task';
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    currentEditId = null;
    taskForm.classList.add('active');
}

// Hide task form
function hideTaskForm() {
    taskForm.classList.remove('active');
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        formTitle.textContent = 'Edit Task';
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        currentEditId = id;
        taskForm.classList.add('active');
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    }
}

// Toggle task status
function toggleTaskStatus(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        renderTasks();
    }
}

// Save task
function saveTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    if (currentEditId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === currentEditId);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description;
        }
    } else {
        // Add new task
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        tasks.push({
            id: newId,
            title,
            description,
            completed: false
        });
    }
    
    hideTaskForm();
    renderTasks();
}

// Event listeners
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
addTaskBtn.addEventListener('click', showAddTaskForm);
saveTaskButton.addEventListener('click', saveTask);
cancelFormButton.addEventListener('click', hideTaskForm);

// Close modal when clicking outside of modal content
modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Make functions available globally
window.showAddTaskForm = showAddTaskForm;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTaskStatus = toggleTaskStatus;
