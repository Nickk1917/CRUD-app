// backend API (change if port is  different)
const API_URL = "http://localhost:3000/api/students";

// global stuff
let students = [];
let editingId = null;
let deleteId = null;

// grabbing elements
const studentForm = document.getElementById("studentForm");
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const noData = document.getElementById("noData");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const deleteModal = document.getElementById("deleteModal");

// load when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
});

// GET ALL STUDENTS
async function loadStudents() {
    showLoading();

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.success) {
            students = data.data;
            renderStudents();
        } else {
            showNotification("Could not load students", "danger");
        }

    } catch (err) {
        console.log("Server error:", err);
        showNotification("Backend not running or connection failed", "danger");
    }

    hideLoading();
}

// ADD OR UPDATE
studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentData = {
        name: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        phone: document.getElementById("studentPhone").value.trim(),
        course: document.getElementById("studentCourse").value,
        year: document.getElementById("studentYear").value
    };

    if (editingId) {
        await updateStudent(editingId, studentData);
    } else {
        await addStudent(studentData);
    }
});

async function addStudent(student) {
    showLoading();

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        const data = await res.json();

        if (data.success) {
            showNotification("Student added 👍", "success");
            resetForm();
            loadStudents();
        } else {
            showNotification(data.message || "Add failed", "danger");
        }

    } catch (err) {
        console.log(err);
        showNotification("Error while adding", "danger");
    }

    hideLoading();
}


// DISPLAY TABLE

function renderStudents(list = students) {

    tableBody.innerHTML = "";
    totalCount.textContent = `Total Students: ${list.length}`;

    if (list.length === 0) {

        noData.style.display = "block";
        document.querySelector(".table-container").style.display = "none";
        return;
    }

    noData.style.display = "none";

    document.querySelector(".table-container").style.display = "block";

    list.forEach((s, i) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${safe(s.name)}</td>
            <td>${safe(s.email)}</td>
            <td>${safe(s.phone)}</td>
            <td>${safe(s.course)}</td>
            <td>${safe(s.year)}</td>
            <td>
                <button class="btn btn-edit" onclick="editStudent('${s._id}')">Edit</button>
                <button class="btn btn-delete" onclick="showDeleteModal('${s._id}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function safe(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// EDIT

function editStudent(id) {
    const s = students.find(x => x._id === id);
    if (!s) return;

    document.getElementById("studentName").value = s.name;
    document.getElementById("studentEmail").value = s.email;
    document.getElementById("studentPhone").value = s.phone;
    document.getElementById("studentCourse").value = s.course;
    document.getElementById("studentYear").value = s.year;

    editingId = id;

    formTitle.textContent = "Update Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.style.display = "inline-block";

    document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
}

async function updateStudent(id, student) {
    showLoading();

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        const data = await res.json();

        if (data.success) {
            showNotification("Updated successfully", "success");
            resetForm();
            loadStudents();
        } else {
            showNotification(data.message || "Update failed", "danger");
        }

    } catch (err) {
        console.log(err);
        showNotification("Error updating", "danger");
    }

    hideLoading();
}


// DELETE function

function showDeleteModal(id) {
    deleteId = id;
    deleteModal.classList.add("active");
}

document.getElementById("confirmDelete").addEventListener("click", async () => {
    if (!deleteId) return;

    await deleteStudent(deleteId);
    deleteModal.classList.remove("active");
    deleteId = null;
});

document.getElementById("cancelDelete").addEventListener("click", () => {
    deleteModal.classList.remove("active");
    deleteId = null;
});

async function deleteStudent(id) {
    showLoading();

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
            showNotification("Student deleted", "success");
            loadStudents();
        } else {
            showNotification(data.message || "Delete failed", "danger");
        }

    } catch (err) {
        console.log(err);
        showNotification("Delete error", "danger");
    }

    hideLoading();
}


// SEARCH


searchInput.addEventListener("input", (e) => {

    const value = e.target.value.toLowerCase().trim();

    if (!value) {

        renderStudents();
        return;
    }

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(value) ||
        s.email.toLowerCase().includes(value) ||
        s.phone.includes(value) ||
        s.course.toLowerCase().includes(value) ||
        s.year.toLowerCase().includes(value)
    );

    renderStudents(filtered);
});


// FORM RESET

function resetForm() {
    studentForm.reset();
    editingId = null;
    formTitle.textContent = "Add New Student";
    submitBtn.textContent = "Add Student";
    cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", resetForm);


// LOADING (very basic)

function showLoading() {
    document.body.style.cursor = "wait";
}

function hideLoading() {
    document.body.style.cursor = "default";
}


// NOTIFICATION

function showNotification(msg, type) {

    const div = document.createElement("div");
    div.textContent = msg;

    div.style.position = "fixed";
    div.style.top = "20px";
    div.style.right = "20px";
    div.style.padding = "12px 20px";
    div.style.color = "white";
    div.style.borderRadius = "6px";
    div.style.background = type === "success" ? "green" : "red";
    div.style.zIndex = "9999";


    document.body.appendChild(div);

    setTimeout(() => div.remove(), 3000);
}

console.log("App connected to backend ✔");
