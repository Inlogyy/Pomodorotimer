// Timer functionality
let timeLeft = 25 * 60;
let isActive = false;
let isWork = true;
let pomodoroCount = 0;
let interval;

const timerType = document.getElementById('timerType');
const timeDisplay = document.getElementById('timeDisplay');
const toggleTimerBtn = document.getElementById('toggleTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const pomodoroCountDisplay = document.getElementById('pomodoroCount');
const workIntervalInput = document.getElementById('workInterval');
const shortBreakIntervalInput = document.getElementById('shortBreakInterval');
const longBreakIntervalInput = document.getElementById('longBreakInterval');

function updateTimer() {
    if (isActive && timeLeft > 0) {
        timeLeft--;
        updateTimeDisplay();
    } else if (timeLeft === 0) {
        if (isWork) {
            pomodoroCount++;
            pomodoroCountDisplay.textContent = pomodoroCount;
            if (pomodoroCount % 4 === 0) {
                timeLeft = parseInt(longBreakIntervalInput.value) * 60;
            } else {
                timeLeft = parseInt(shortBreakIntervalInput.value) * 60;
            }
            suggestBreakActivity();
        } else {
            timeLeft = parseInt(workIntervalInput.value) * 60;
            breakSuggestion.textContent = '';
        }
        isWork = !isWork;
        timerType.textContent = isWork ? 'Work' : 'Break';
        updateTimeDisplay();
    }
}

function updateTimeDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    isActive = !isActive;
    toggleTimerBtn.textContent = isActive ? 'Pause' : 'Start';
    if (isActive) {
        interval = setInterval(updateTimer, 1000);
    } else {
        clearInterval(interval);
    }
}

function resetTimer() {
    isActive = false;
    isWork = true;
    
    // Reset input boxes to default values
    workIntervalInput.value = '25';
    shortBreakIntervalInput.value = '5';
    longBreakIntervalInput.value = '15';
    
    timeLeft = parseInt(workIntervalInput.value) * 60;
    pomodoroCount = 0;
    timerType.textContent = 'Work';
    toggleTimerBtn.textContent = 'Start';
    pomodoroCountDisplay.textContent = '0';
    clearInterval(interval);
    updateTimeDisplay();
}

function updateTimerDuration() {
    if (!isActive) {
        if (isWork) {
            timeLeft = parseInt(workIntervalInput.value) * 60;
        } else {
            timeLeft = parseInt(shortBreakIntervalInput.value) * 60;
        }
        updateTimeDisplay();
    }
}

toggleTimerBtn.addEventListener('click', toggleTimer);
resetTimerBtn.addEventListener('click', resetTimer);
workIntervalInput.addEventListener('change', updateTimerDuration);
shortBreakIntervalInput.addEventListener('change', updateTimerDuration);
longBreakIntervalInput.addEventListener('change', updateTimerDuration);

// Task list functionality
const newTaskInput = document.getElementById('newTask');
const newTaskTagInput = document.getElementById('newTaskTag');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('tasks');
let tasks = [];

function addTask() {
    const taskText = newTaskInput.value.trim();
    const taskTags = newTaskTagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (taskText !== '') {
        const task = { id: Date.now(), text: taskText, completed: false, tags: taskTags, status: 'todo' };
        tasks.push(task);
        renderTasks();
        renderKanbanBoard();
        newTaskInput.value = '';
        newTaskTagInput.value = '';
    }
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed, status: task.completed ? 'todo' : 'done' } : task
    );
    renderTasks();
    renderKanbanBoard();
    updateProductivityScore();
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}">${task.text}</span>
            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            <button class="remove-task">Remove</button>
        `;
        li.querySelector('input').addEventListener('change', () => toggleTask(task.id));
        li.querySelector('.remove-task').addEventListener('click', () => removeTask(task.id));
        taskList.appendChild(li);
    });
}

function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    renderKanbanBoard();
    updateProductivityScore();
}

addTaskBtn.addEventListener('click', addTask);

// Kanban board functionality
const todoTasks = document.getElementById('todoTasks');
const inProgressTasks = document.getElementById('inProgressTasks');
const doneTasks = document.getElementById('doneTasks');

function renderKanbanBoard() {
    todoTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    doneTasks.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text;
        li.draggable = true;
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
        });

        switch (task.status) {
            case 'todo':
                todoTasks.appendChild(li);
                break;
            case 'inProgress':
                inProgressTasks.appendChild(li);
                break;
            case 'done':
                doneTasks.appendChild(li);
                break;
        }
    });
}

[todoTasks, inProgressTasks, doneTasks].forEach(column => {
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    column.addEventListener('drop', (e) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text'));
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            if (column === todoTasks) task.status = 'todo';
            else if (column === inProgressTasks) task.status = 'inProgress';
            else if (column === doneTasks) task.status = 'done';
            renderKanbanBoard();
            updateProductivityScore();
        }
    });
});

// Productivity score
const productivityScoreDisplay = document.getElementById('productivityScore');
let productivityScore = 0;

function updateProductivityScore() {
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const totalTasks = tasks.length;
    productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    productivityScoreDisplay.textContent = productivityScore;
}

// Break activity suggestions
const breakSuggestion = document.getElementById('breakSuggestion');
const breakActivities = [
    "Take a short walk",
    "Do some stretching exercises",
    "Practice deep breathing",
    "Grab a healthy snack",
    "Listen to a favorite song",
    "Tidy up your workspace",
    "Call a friend or family member",
    "Read a few pages of a book",
    "Meditate for a few minutes",
    "Do a quick sketch or doodle"
];

function suggestBreakActivity() {
    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
    breakSuggestion.textContent = `Break suggestion: ${randomActivity}`;
}

// Dark mode toggle functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function updateDarkModeButtonText() {
    darkModeToggle.textContent = body.classList.contains('dark-mode') 
        ? 'Turn on light mode' 
        : 'Turn on dark mode';
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateDarkModeButtonText();
});

// Initial setup
updateTimeDisplay();
renderTasks();
renderKanbanBoard();
updateProductivityScore();
updateDarkModeButtonText();
