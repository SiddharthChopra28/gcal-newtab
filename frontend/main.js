async function putDates() {
    const _dates = await fetch("http://localhost:3000/api/getCurrent35", {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    })

    dates_json = await _dates.json()
    console.log(dates_json)

    const now = new Date()
    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById("header").innerText = monthName
    console.log(monthName)

    let datesndays = dates_json.daysOfCal.map((string) => {
        const d = new Date(string)
        return [d.getDate(), d.toLocaleDateString('en-US', { weekday: 'long' })]
    })
    globalThis.currentMonthDates = {
        dates: dates_json.daysOfCal.map((string) => {
            return new Date(string);
        }), ids: [], events: []
    }

    let counter = 0;
    for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 7; j++) {
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

    const startDate = new Date(range.start.dateTime || range.start.date);
    const endDate = new Date(range.end.dateTime || range.end.date);

    let result = (
        startDate <= endOfDay &&
        endDate >= startOfDay
    );
    return result;
}

function addEventToCalendar(e) {
    for (let x = 0; x < globalThis.currentMonthDates.dates.length; x++) {
        if (checkIntersection(e, globalThis.currentMonthDates.dates[x])) {
            console.log('truree')
            globalThis.currentMonthDates.events[x].push(e);
            let l = globalThis.currentMonthDates.events[x].length;
            let onedot = '<div class=\"dot\"> </div>'
            document.getElementById(globalThis.currentMonthDates.ids[x]).getElementsByClassName("eventdots")[0].innerHTML = onedot.repeat(l);
            return;
        }
    }
}

async function putEvents() {

    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        // if on brave, need to enable google login for extensions in settings
        console.log(token);

        const events = await fetch("http://localhost:3000/api/getEvents", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token })

        })

        let events_json = await events.json()

        for (let calindex in events_json) {
            for (e of events_json[calindex].items) {
                let startDate = new Date(e.start)
                let endDate = new Date(e.end)

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


window.onload = () => {
    putDates();
    putEvents();
    setInterval(updateClock, 1000);
    updateClock();

};
///////////////////////////////////////////////////////
const pageContent = document.getElementById('mainpage');
const modalOverlay = document.getElementById('modalOverlay');
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
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

let currentModalID = null;
let currentEditId = null;

function openModal(id) {
    modalOverlay.classList.add('active');
    pageContent.classList.add('blurred');
    currentModalID = id;
    let index = globalThis.currentMonthDates.ids.indexOf(id);

    renderTasks(index);
}

function closeModal() {
    modalOverlay.classList.remove('active');
    pageContent.classList.remove('blurred');
    currentModalID = null;
    hideTaskForm();
}

function renderTasks(index) {
    let tasks = globalThis.currentMonthDates.events[index]
    if (tasks.length == 0) {
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <h3>No events yet</h3>
                <button class="modal-button add-task-button" id="addtask">Add an event</button>
            </div>
        `;
        document.getElementById("addtask").addEventListener('click', showAddTaskForm)
        return;
    }

    let maxindex = tasks.length;
    const taskListHtml = `
        <ul class="task-list">
            ${tasks.map((task, j) => `
                <li class="task-item">
                    <div class="task-content">
                        <h3 class="task-title">${task.summary}</h3>
                        <p class="task-description">${task.description}</p>
                    </div>
                    <div class="task-actions">
                        <button class="task-button edit-button" id="edittask${index + '-' + j}" title="Edit event">✎</button>
                        <button class="task-button delete-button" id="deletetask${index + '-' + j}" title="Delete event">✕</button>
                    </div>
                </li>
            `
    ).join('')}
        </ul>
    `;
    taskListContainer.innerHTML = taskListHtml;
    console.log(maxindex)
    for (let i = 0; i < maxindex; i++) {
        document.getElementById("edittask" + index + '-' + i).addEventListener('click', () => { editTask(index, i) })
        document.getElementById("deletetask" + index + '-' + i).addEventListener('click', () => { deleteTask(index, i) })
        console.log('ran')
    }

}

function showAddTaskForm() {
    formTitle.textContent = 'Add New Event';
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    let currentEditId = null;
    taskForm.classList.add('active');
}

function hideTaskForm() {
    taskForm.classList.remove('active');
}

function editTask(index, i) {
    const task = globalThis.currentMonthDates.events[index][i];
    formTitle.textContent = 'Edit event';
    taskTitleInput.value = task.summary;
    taskDescriptionInput.value = task.description;
    let currentEditId = [index, i];
    const formatInputDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 25);
    };

    startDateInput.value = formatInputDate(task.start.dateTime || task.start.date);
    endDateInput.value = formatInputDate(task.end.dateTime || task.end.date);

    taskForm.classList.add('active');
    

}

function deleteTask(index, i) {
    if (confirm('Are you sure you want to delete this event?')) {
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            console.log(token);

            const body = {
                token: token,
                id: globalThis.currentMonthDates.events[index][i].id
            }
            const res = await fetch('http://localhost:3000/api/deleteEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
        });
        var res_json = await res.json()
        console.log(res_json)
        
    })
}
window.location.reload(true);

}

async function saveTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const formatInputDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 25);
    };

    const startDate = formatInputDate(startDateInput.value)
    const endDate = formatInputDate(endDateInput.value)


    if (!title) {
        alert('Please enter an event title');
        return;
    }
    if (!startDate) {
        alert('Please enter start date');
        return;
    }
    if (!endDate) {
        alert('Please enter end date');
        return;
    }

    if (currentEditId !== null) {
        const task_id = globalThis.currentMonthDates.events[currentEditId[0]][currentEditId[1]].id
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            console.log(token);

            const event = {
                summary: title,
                description: description,
                start: {
                    dateTime: startDate,
                    timeZone: 'Asia/Kolkata'
                },
                end: {
                    dateTime: endDate,
                    timeZone: 'Asia/Kolkata'
                }
            }
            const body = {
                event: event,
                token: token,
                id: task_id
            }
            const res = await fetch('http://localhost:3000/api/editEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
        })
    }

    else {
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            // if on brave, need to enable google login for extensions in settings
            console.log(token);

            const event = {
                summary: title,
                description: description,
                start: {
                    dateTime: startDate,
                    timeZone: 'Asia/Kolkata'
                },
                end: {
                    dateTime: endDate,
                    timeZone: 'Asia/Kolkata'
                }
            }
            const body = {
                event: event,
                token: token
            }
            const res = await fetch('http://localhost:3000/api/newEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
        })
    }

    window.location.reload(true);

}

[...document.getElementsByClassName('calbox')].forEach(el => { el.addEventListener('click', (e) => openModal(e.currentTarget.id)) });
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
addTaskBtn.addEventListener('click', showAddTaskForm);
saveTaskButton.addEventListener('click', saveTask);
cancelFormButton.addEventListener('click', hideTaskForm);

modalOverlay.addEventListener('click', function (event) {
    if (event.target === modalOverlay) {
        closeModal();
    }
});


window.showAddTaskForm = showAddTaskForm;
window.editTask = editTask;
window.deleteTask = deleteTask;
