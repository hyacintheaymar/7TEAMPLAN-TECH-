//===
// === GESTION DU LOCAL STORAGE POUR SAUVEGARDER TOUTES LES DONNÉES ===
function saveToStorage() {
    const data = {
        employees,
        departments,
        teams,
        assignments,
        darkMode: document.body.classList.contains('dark-mode')
    };
    localStorage.setItem('teamplan-data-2025', JSON.stringify(data));
}
function loadFromStorage() {
    const saved = localStorage.getItem('teamplan-data-2025');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.employees) employees = data.employees;
        if (data.departments) departments = data.departments;
        if (data.teams) teams = data.teams;
        if (data.assignments) assignments = data.assignments;
        // Restaurer le mode sombre
        if (data.darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('dark-mode').checked = true;
        }
    }
}
// === GESTION DE LA DATE COURANTE (Année 2025) ===
let currentViewDate = new Date(2025, 0, 6); // Première semaine complète de 2025
function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        week.push(day);
    }
    return week;
}
function formatDate(date) {
    const options = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
}
function updateWeekDisplay() {
    const week = getWeekRange(currentViewDate);
    const start = week[0];
    const end = week[6];
    // 🔧 CORRECTION : éviter "23 23 février"
    const startMonth = start.toLocaleDateString('fr-FR', { month: 'long' });
    const endMonth = end.toLocaleDateString('fr-FR', { month: 'long' });
    let displayText = `Semaine du ${start.getDate()} ${startMonth}`;
    if (startMonth !== endMonth) {
        displayText += ` au ${end.getDate()} ${endMonth}`;
    } else {
        displayText += ` au ${end.getDate()}`;
    }
    document.getElementById('current-week').textContent = displayText;
    // Mettre à jour les dates dans les headers
    document.querySelectorAll('.day-date').forEach((el, i) => {
        el.textContent = week[i].getDate();
    });
    document.querySelectorAll('.day-name').forEach((el, i) => {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        el.textContent = days[i];
    });
}
// Données de l'application
let employees = [
    { id: 1, name: "Jean Dupont", department: "Technique", color: "#4A86E8", initials: "JD" },
    { id: 2, name: "Marie Martin", department: "Marketing", color: "#6AA84F", initials: "MM" },
    { id: 3, name: "Thomas Petit", department: "Technique", color: "#4A86E8", initials: "TP" },
    { id: 4, name: "Sophie Leroy", department: "RH", color: "#C27BA0", initials: "SL" },
    { id: 5, name: "Luc Bernard", department: "Marketing", color: "#6AA84F", initials: "LB" },
    { id: 6, name: "Camille Moreau", department: "RH", color: "#C27BA0", initials: "CM" },
    { id: 7, name: "Antoine Dubois", department: "Technique", color: "#4A86E8", initials: "AD" }
];
let departments = {
    Technique: { color: "#4A86E8" },
    Marketing: { color: "#6AA84F" },
    RH: { color: "#C27BA0" }
};
let teams = [
    { id: 1, name: "Alpha", members: [1, 2, 3], color: "#4A86E8" },
    { id: 2, name: "Bêta", members: [4, 5], color: "#6AA84F" },
    { id: 3, name: "Gamma", members: [6, 7], color: "#C27BA0" }
];
let assignments = [
    { id: 1, teamId: 1, day: 1, startHour: 9, endHour: 12 },
    { id: 2, teamId: 2, day: 2, startHour: 11, endHour: 13 },
    { id: 3, teamId: 3, day: 3, startHour: 14, endHour: 16 },
    { id: 4, teamId: 1, day: 4, startHour: 10, endHour: 12 },
    { id: 5, teamId: 2, day: 5, startHour: 15, endHour: 17 }
];
// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    // Ajouter un fond flou du calendrier en arrière-plan
    const bg = document.createElement('div');
    bg.className = 'calendar-background';
    document.body.appendChild(bg);
    updateWeekDisplay();
    generateCalendar();
    generateEmployeeList();
    generateTeamList();
    setupTeamMembersSelect();
    setupDepartmentForm();
    generateDepartmentList();
    setupEventListeners();
    setupDragAndDrop();
    setupDragAndDropForAssignments();
});
// Générer le calendrier
function generateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    const week = getWeekRange(currentViewDate);
    for (let hour = 8; hour <= 20; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${hour}:00`;
        calendarGrid.appendChild(timeSlot);
        week.forEach((date, dayIndex) => {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.dataset.hour = hour;
            dayCell.dataset.day = dayIndex;
            dayCell.dataset.date = date.toISOString().split('T')[0]; // Ajout de la date
            // 🔧 CORRECTION : Filtrer par jour ET par date
            const dayAssignments = assignments.filter(a =>
                a.day === dayIndex &&
                a.date === date.toISOString().split('T')[0] && // Vérification de la date
                hour >= a.startHour &&
                hour < a.endHour
            );
            if (dayAssignments.length > 0) {
                const assignment = dayAssignments[0];
                const team = teams.find(t => t.id === assignment.teamId);
                if (team) {
                    const assignmentCard = document.createElement('div');
                    assignmentCard.className = 'assignment-card new-item';
                    assignmentCard.style.setProperty('--team-color', team.color);
                    assignmentCard.style.top = '8px';
                    assignmentCard.style.bottom = '8px';
                    assignmentCard.dataset.assignmentId = assignment.id;
                    assignmentCard.draggable = true;
                    // === MODIFICATION : Afficher uniquement le nom du groupe ===
                    assignmentCard.innerHTML = `
                        <div class="team-name">${team.name}</div>
                    `;
                    assignmentCard.addEventListener('click', () => {
                        showAssignmentDetails(assignment.id);
                    });
                    dayCell.appendChild(assignmentCard);
                }
            }
            calendarGrid.appendChild(dayCell);
        });
    }
}
// === DRAG & DROP : déplacer une affectation existante ===
function setupDragAndDropForAssignments() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('assignment-card')) {
            const assignmentId = parseInt(e.target.dataset.assignmentId);
            e.dataTransfer.setData('assignmentId', assignmentId);
            e.target.style.opacity = '0.5';
        }
    });
    calendarGrid.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('assignment-card')) {
            e.target.style.opacity = '1';
        }
    });
    calendarGrid.addEventListener('dragover', (e) => {
        if (e.target.classList.contains('day-cell')) {
            e.preventDefault();
            e.target.classList.add('teams-hover');
        }
    });
    calendarGrid.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('day-cell')) {
            e.target.classList.remove('teams-hover');
        }
    });
    calendarGrid.addEventListener('drop', (e) => {
        e.preventDefault();
        const dayCell = e.target.closest('.day-cell');
        if (!dayCell) return;
        const assignmentId = parseInt(e.dataTransfer.getData('assignmentId'));
        const newDayIndex = parseInt(dayCell.dataset.day);
        const hour = parseInt(dayCell.dataset.hour);
        const newDate = dayCell.dataset.date; // Récupérer la date de la cellule
        if (isNaN(assignmentId) || isNaN(newDayIndex) || isNaN(hour)) return;
        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        assignment.day = newDayIndex;
        assignment.startHour = hour;
        assignment.endHour = hour + 2;
        assignment.date = newDate; // Mettre à jour la date de l'affectation
        saveToStorage();
        generateCalendar();
        dayCell.classList.remove('teams-hover');
    });
}
// === GESTION DES DÉPARTEMENTS ===
function setupDepartmentForm() {
    const addDeptBtn = document.getElementById('add-department');
    if (!addDeptBtn) return;
    addDeptBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('dept-name');
        const colorInput = document.getElementById('dept-color');
        const name = nameInput.value.trim();
        const color = colorInput.value;
        if (!name) {
            alert('Veuillez entrer un nom de département.');
            return;
        }
        if (departments[name]) {
            alert(`Le département "${name}" existe déjà.`);
            return;
        }
        departments[name] = { color };
        nameInput.value = ''; // Réinitialiser le champ
        generateDepartmentList();
        generateEmployeeDeptSelect();
        saveToStorage();
        alert(`Département "${name}" ajouté avec succès !`);
    });
}
function generateDepartmentList() {
    const list = document.getElementById('department-list');
    if (!list) return;
    list.innerHTML = '';
    Object.keys(departments).forEach(name => {
        const chip = document.createElement('div');
        chip.className = 'dept-chip';
        chip.innerHTML = `
            <span class="color-dot" style="background-color: ${departments[name].color}"></span>
            ${name}
            <button class="delete-btn" data-dept="${name}">×</button>
        `;
        list.appendChild(chip);
    });
    // Suppression
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deptName = e.target.dataset.dept;
            if (!confirm(`Supprimer le département "${deptName}" ? Les employés seront réaffectés.`)) return;
            delete departments[deptName];
            // Réaffecter les employés concernés au premier département disponible
            const firstDept = Object.keys(departments)[0];
            if (firstDept) {
                employees
                    .filter(emp => emp.department === deptName)
                    .forEach(emp => {
                        emp.department = firstDept;
                        emp.color = departments[firstDept].color;
                    });
            }
            generateDepartmentList();
            generateEmployeeDeptSelect();
            generateEmployeeList(); // Pour mettre à jour la couleur
            saveToStorage();
        });
    });
}
function generateEmployeeDeptSelect() {
    const select = document.getElementById('employee-dept');
    if (!select) return;
    select.innerHTML = '';
    Object.keys(departments).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}
// === GESTION DES EMPLOYÉS ===
function generateEmployeeList() {
    const employeeList = document.getElementById('employee-list');
    if (!employeeList) return;
    employeeList.innerHTML = '';
    employees.forEach(employee => {
        const employeeCard = document.createElement('div');
        employeeCard.className = 'employee-card new-item';
        employeeCard.dataset.id = employee.id;
        employeeCard.draggable = true;
        employeeCard.innerHTML = `
            <div class="employee-avatar" style="background-color: ${employee.color}">
                ${employee.initials}
            </div>
            <div class="employee-info">
                <div class="employee-name">${employee.name}</div>
                <div class="employee-dept">${employee.department}</div>
            </div>
            <div class="employee-actions">
                <button class="edit-employee" data-id="${employee.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-employee" data-id="${employee.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        employeeList.appendChild(employeeCard);
    });
    // Boutons modifier/supprimer
    document.querySelectorAll('.edit-employee').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const employeeId = parseInt(btn.dataset.id);
            editEmployee(employeeId);
        });
    });
    document.querySelectorAll('.delete-employee').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const employeeId = parseInt(btn.dataset.id);
            deleteEmployee(employeeId);
        });
    });
}
function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    const newName = prompt('Modifier le nom:', employee.name);
    if (newName && newName.trim() !== '') {
        employee.name = newName.trim();
        employee.initials = getInitials(newName);
        generateEmployeeList();
        saveToStorage();
        alert('Employé modifié avec succès!');
    }
}
function deleteEmployee(employeeId) {
    if (!confirm('Supprimer cet employé ?')) return;
    const index = employees.findIndex(e => e.id === employeeId);
    if (index !== -1) {
        employees.splice(index, 1);
        generateEmployeeList();
        setupTeamMembersSelect();
        saveToStorage();
        alert('Employé supprimé avec succès!');
    }
}
// === GESTION DES ÉQUIPES ===
function generateTeamList() {
    const teamList = document.getElementById('team-list');
    if (!teamList) return;
    teamList.innerHTML = '';
    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card new-item';
        teamCard.dataset.id = team.id;
        teamCard.innerHTML = `
            <div class="team-header">
                <div class="team-name" style="color: ${team.color}">${team.name}</div>
                <div class="team-members-count">${team.members.length} membre(s)</div>
            </div>
            <div class="team-members-list">
                ${team.members.map(memberId => {
                    const member = employees.find(e => e.id === memberId);
                    return `<div class="team-member">${member ? member.name : 'Inconnu'}</div>`;
                }).join('')}
            </div>
            <div class="team-actions">
                <button class="edit-team" data-id="${team.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-team" data-id="${team.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        teamList.appendChild(teamCard);
    });
    document.querySelectorAll('.edit-team').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const teamId = parseInt(btn.dataset.id);
            editTeam(teamId);
        });
    });
    document.querySelectorAll('.delete-team').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const teamId = parseInt(btn.dataset.id);
            deleteTeam(teamId);
        });
    });
}
function setupTeamMembersSelect() {
    const membersSelect = document.getElementById('team-members-select');
    if (!membersSelect) return;
    membersSelect.innerHTML = '';
    employees.forEach(employee => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-select-item';
        memberItem.innerHTML = `
            <input type="checkbox" id="member-${employee.id}" value="${employee.id}">
            <label for="member-${employee.id}">${employee.name} (${employee.department})</label>
        `;
        membersSelect.appendChild(memberItem);
    });
}
function editTeam(teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    const newName = prompt('Modifier le nom:', team.name);
    if (newName && newName.trim() !== '') {
        team.name = newName.trim();
        generateTeamList();
        saveToStorage();
        alert('Équipe modifiée avec succès!');
    }
}
function deleteTeam(teamId) {
    if (!confirm('Supprimer cette équipe ?')) return;
    const index = teams.findIndex(t => t.id === teamId);
    if (index !== -1) {
        teams.splice(index, 1);
        generateTeamList();
        saveToStorage();
        alert('Équipe supprimée avec succès!');
    }
}
// === PANNEAU D'AFFECTION ===
function showAssignmentDetails(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    const team = teams.find(t => t.id === assignment.teamId);
    if (!assignment || !team) return;
    const employeePanel = document.getElementById('employee-panel');
    employeePanel.classList.add('open');
    const employeeList = document.getElementById('employee-panel-list');
    employeeList.innerHTML = '';
    document.getElementById('panel-title').textContent = team.name;
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.style.marginBottom = '24px';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.innerHTML = `
        <button class="teams-btn" id="edit-assignment" style="flex: 1">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button class="teams-btn" id="duplicate-assignment" style="flex: 1">
            <i class="fas fa-copy"></i> Dupliquer
        </button>
        <button class="teams-btn" id="delete-assignment" style="background-color: #ff4d4d; flex: 1">
            <i class="fas fa-trash"></i> Supprimer
        </button>
    `;
    employeeList.appendChild(actions);
    const details = document.createElement('div');
    details.className = 'assignment-details';
    details.style.marginBottom = '24px';
    details.style.padding = '16px';
    details.style.backgroundColor = '#f9f9f9';
    details.style.borderRadius = '8px';
    // 🔧 CORRECTION : Afficher la date correcte
    const week = getWeekRange(currentViewDate);
    const assignmentDate = week[assignment.day];
    const dateStr = assignmentDate ? formatDate(assignmentDate) : 'Date inconnue';
    details.innerHTML = `
        <div style="margin-bottom: 16px">
            <div style="font-size: 14px; color: #6264A7; margin-bottom: 4px">Date</div>
            <div style="font-weight: 600">${getDayName(assignment.day)} ${dateStr} ${assignment.startHour}h - ${assignment.endHour}h</div>
        </div>
        <div>
            <div style="font-size: 14px; color: #6264A7; margin-bottom: 4px">Département</div>
            <div style="font-weight: 600">${employees[0].department}</div>
        </div>
    `;
    employeeList.appendChild(details);
    const membersTitle = document.createElement('div');
    membersTitle.className = 'panel-title';
    membersTitle.textContent = 'Membres de l\'équipe';
    membersTitle.style.marginBottom = '16px';
    employeeList.appendChild(membersTitle);
    team.members.forEach(memberId => {
        const member = employees.find(e => e.id === memberId);
        if (!member) return;
        const memberCard = document.createElement('div');
        memberCard.className = 'employee-card';
        memberCard.innerHTML = `
            <div class="employee-avatar" style="background-color: ${member.color}">
                ${member.initials}
            </div>
            <div class="employee-info">
                <div class="employee-name">${member.name}</div>
                <div class="employee-dept">${member.department}</div>
            </div>
        `;
        employeeList.appendChild(memberCard);
    });
    document.getElementById('close-panel').addEventListener('click', () => {
        employeePanel.classList.remove('open');
    });
    document.getElementById('edit-assignment').addEventListener('click', () => {
        alert('Fonctionnalité de modification à implémenter');
    });
    document.getElementById('duplicate-assignment').addEventListener('click', () => {
        // 🔧 CORRECTION : Ajout de la date lors de la duplication
        const week = getWeekRange(currentViewDate);
        const assignmentDate = week[assignment.day];
        const newAssignment = {
            id: assignments.length + 1,
            teamId: assignment.teamId,
            day: assignment.day,
            startHour: assignment.startHour + 2,
            endHour: assignment.endHour + 2,
            date: assignmentDate.toISOString().split('T')[0] // Ajout de la date
        };
        assignments.push(newAssignment);
        generateCalendar();
        employeePanel.classList.remove('open');
        saveToStorage();
        alert('Affectation dupliquée avec succès!');
    });
    document.getElementById('delete-assignment').addEventListener('click', () => {
        const index = assignments.findIndex(a => a.id === assignmentId);
        if (index !== -1) {
            assignments.splice(index, 1);
            generateCalendar();
            employeePanel.classList.remove('open');
            saveToStorage();
            alert('Affectation supprimée avec succès!');
        }
    });
}
function getDayName(dayIndex) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return days[dayIndex] || '';
}
// === ÉVÉNEMENTS PRINCIPAUX ===
function setupEventListeners() {
    // Navigation entre semaines
    document.getElementById('prev-week').addEventListener('click', () => {
        currentViewDate.setDate(currentViewDate.getDate() - 7);
        updateWeekDisplay();
        generateCalendar();
    });
    document.getElementById('next-week').addEventListener('click', () => {
        currentViewDate.setDate(currentViewDate.getDate() + 7);
        updateWeekDisplay();
        generateCalendar();
    });
    // === MODIFICATION : Remplacement de la fonction d'affectation aléatoire ===
    document.getElementById('add-assignment').addEventListener('click', openManualAssignmentModal);
    // Changer le mode de couleur
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    // Fermer panneau
    document.getElementById('close-panel').addEventListener('click', () => {
        document.getElementById('employee-panel').classList.remove('open');
    });
    // Navigation entre vues
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));
            document.getElementById(`${btn.dataset.view}-view`).classList.add('active-view');
        });
    });
    // Ajouter employé
    document.getElementById('add-employee').addEventListener('click', () => {
        const name = document.getElementById('employee-name').value;
        const dept = document.getElementById('employee-dept').value;
        if (name) {
            const newEmployee = {
                id: employees.length + 1,
                name: name,
                department: dept,
                color: departments[dept].color,
                initials: getInitials(name)
            };
            employees.push(newEmployee);
            generateEmployeeList();
            setupTeamMembersSelect();
            document.getElementById('employee-name').value = '';
            saveToStorage();
            alert('Employé ajouté avec succès!');
        } else {
            alert('Veuillez entrer un nom');
        }
    });
    // Créer équipe
    document.getElementById('create-team').addEventListener('click', () => {
        const name = document.getElementById('team-name').value;
        const selectedMembers = Array.from(document.querySelectorAll('#team-members-select input:checked'))
            .map(input => parseInt(input.value));
        if (name && selectedMembers.length > 0) {
            const newTeam = {
                id: teams.length + 1,
                name: name,
                members: selectedMembers,
                color: departments[employees.find(e => e.id === selectedMembers[0]).department].color
            };
            teams.push(newTeam);
            generateTeamList();
            document.getElementById('team-name').value = '';
            document.querySelectorAll('#team-members-select input').forEach(input => input.checked = false);
            saveToStorage();
            alert('Équipe créée avec succès!');
        } else {
            alert('Nom + au moins un membre');
        }
    });
    // Mode sombre
    document.getElementById('dark-mode').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        saveToStorage();
    });
}
// === DRAG & DROP INITIAL (ajout d'employé) ===
function setupDragAndDrop() {
    const employeeCards = document.querySelectorAll('.employee-card');
    const calendarCells = document.querySelectorAll('.day-cell');
    employeeCards.forEach(card => card.addEventListener('dragstart', handleDragStart));
    calendarCells.forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('drop', handleDrop);
    });
}
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.closest('.employee-card').dataset.id);
}
function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('teams-hover');
}
function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('teams-hover');
    const employeeId = parseInt(e.dataTransfer.getData('text/plain'));
    const employee = employees.find(e => e.id === employeeId);
    const day = parseInt(e.target.dataset.day);
    const hour = parseInt(e.target.dataset.hour);
    const date = e.target.dataset.date; // Récupérer la date de la cellule
    if (employee) {
        const newAssignment = {
            id: assignments.length + 1,
            teamId: 1,
            day: day,
            startHour: hour,
            endHour: hour + 2,
            date: date // Ajout de la date
        };
        assignments.push(newAssignment);
        generateCalendar();
        e.target.classList.add('pulse-effect');
        setTimeout(() => e.target.classList.remove('pulse-effect'), 500);
        showAssignmentDetails(newAssignment.id);
        saveToStorage();
    }
}
function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
}
// === NOUVELLE FONCTION : MODAL D'AFFECTATION MANUELLE ===
function openManualAssignmentModal() {
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Nouvelle affectation</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group-modal">
                    <label for="assignment-team">Équipe :</label>
                    <select id="assignment-team" class="teams-select">
                        ${teams.map(team => `<option value="${team.id}">${team.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group-modal">
                    <label>Jours :</label>
                    <div class="days-select">
                        <label><input type="checkbox" name="day" value="0"> Lundi</label>
                        <label><input type="checkbox" name="day" value="1"> Mardi</label>
                        <label><input type="checkbox" name="day" value="2"> Mercredi</label>
                        <label><input type="checkbox" name="day" value="3"> Jeudi</label>
                        <label><input type="checkbox" name="day" value="4"> Vendredi</label>
                        <label><input type="checkbox" name="day" value="5"> Samedi</label>
                        <label><input type="checkbox" name="day" value="6"> Dimanche</label>
                    </div>
                </div>
                <div class="form-group-modal">
                    <label for="assignment-start-hour">Heure de début :</label>
                    <input type="time" id="assignment-start-hour" class="teams-select" value="09:00">
                </div>
                <div class="form-group-modal">
                    <label for="assignment-end-hour">Heure de fin :</label>
                    <input type="time" id="assignment-end-hour" class="teams-select" value="17:00">
                </div>
                <div class="modal-actions">
                    <button class="teams-btn secondary" id="cancel-assignment-modal">Annuler</button>
                    <button class="teams-btn" id="confirm-assignment">Créer</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // Écouteurs d'événements
    const closeModal = () => modal.remove();
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-assignment-modal').addEventListener('click', closeModal);
    document.getElementById('confirm-assignment').addEventListener('click', () => {
        const teamId = parseInt(document.getElementById('assignment-team').value);
        const selectedDays = Array.from(document.querySelectorAll('input[name="day"]:checked'))
            .map(input => parseInt(input.value));
        const startTime = document.getElementById('assignment-start-hour').value;
        const endTime = document.getElementById('assignment-end-hour').value;
        // Validation
        if (!selectedDays.length) {
            alert('Veuillez sélectionner au moins un jour.');
            return;
        }
        if (!startTime || !endTime) {
            alert('Veuillez entrer une heure de début et une heure de fin.');
            return;
        }
        // Convertir les heures en nombres pour comparaison
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        if (endTotalMinutes <= startTotalMinutes) {
            alert('L\'heure de fin doit être après l\'heure de début.');
            return;
        }
        // Obtenir la date de la semaine actuelle pour chaque jour sélectionné
        const week = getWeekRange(currentViewDate);
        // Créer les affectations pour chaque jour sélectionné
        selectedDays.forEach(day => {
            const newAssignment = {
                id: Date.now() + Math.random(), // ID unique
                teamId: teamId,
                day: day,
                startHour: startHours, // Stocker uniquement l'heure
                endHour: endHours,      // Stocker uniquement l'heure
                date: week[day].toISOString().split('T')[0] // Ajout de la date
            };
            assignments.push(newAssignment);
        });
        generateCalendar();
        saveToStorage();
        closeModal();
        // Effet visuel sur le bouton
        const button = document.getElementById('add-assignment');
        button.classList.add('pulse-effect');
        setTimeout(() => button.classList.remove('pulse-effect'), 500);
    });
} 