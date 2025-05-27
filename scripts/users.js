import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userListDiv = document.getElementById("userList");
const btnAddUser = document.getElementById("btnAddUser");
const inpEmail = document.getElementById("inpEmail");
const roleCheckboxes = document.querySelectorAll(".role-checkbox");

// Estado local para usuarios cargados
let users = [];
let editingUserId = null;

// Función para cargar usuarios desde Firestore
async function loadUsers() {
  userListDiv.innerHTML = "Cargando usuarios...";
  const querySnapshot = await getDocs(collection(db, "users"));
  users = [];
  querySnapshot.forEach(docSnap => {
    users.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderUserList();
  clearForm();
}

// Renderiza la lista de usuarios en el DOM (con botones Editar y Eliminar)
function renderUserList() {
  if (users.length === 0) {
    userListDiv.innerHTML = "<p>No hay usuarios registrados.</p>";
    return;
  }

  userListDiv.innerHTML = "";

  users.forEach(user => {
    const userDiv = document.createElement("div");
    userDiv.className = "user-item";
    userDiv.style.border = "1px solid #ccc";
    userDiv.style.marginBottom = "10px";
    userDiv.style.padding = "10px";

    userDiv.innerHTML = `
      <p style="color:black;"><strong>Email:</strong> ${user.email}</p>
      <button class="edit-user-btn" data-userid="${user.id}">Editar</button>
      <button class="delete-user-btn" data-userid="${user.id}" style="margin-left:10px; background-color:#d9534f; color:white;">Eliminar</button>
    `;

    userListDiv.appendChild(userDiv);
  });

  // Asignar eventos a botones Editar
  document.querySelectorAll(".edit-user-btn").forEach(btn => {
    btn.onclick = () => {
      const userId = btn.getAttribute("data-userid");
      const user = users.find(u => u.id === userId);
      if (!user) return;

      editingUserId = user.id;
      inpEmail.value = user.email;
      inpEmail.disabled = true;

      roleCheckboxes.forEach(cb => {
        cb.checked = user.roles?.[cb.value] || false;
      });

      btnAddUser.textContent = "Actualizar Usuario";
    };
  });

  // Asignar eventos a botones eliminar
  document.querySelectorAll(".delete-user-btn").forEach(btn => {
    btn.onclick = async () => {
      const userId = btn.getAttribute("data-userid");
      if (confirm("¿Estás seguro de eliminar este usuario?")) {
        try {
          await deleteDoc(doc(db, "users", userId));
          alert("Usuario eliminado.");
          await loadUsers();
        } catch (err) {
          console.error(err);
          alert("Error eliminando usuario.");
        }
      }
    };
  });
}

// Función para limpiar el formulario
function clearForm() {
  editingUserId = null;
  inpEmail.value = "";
  inpEmail.disabled = false;
  roleCheckboxes.forEach(cb => (cb.checked = false));
  btnAddUser.textContent = "Actualizar Usuario";
}

// Función para manejar cambio o enter en el input email
function onEmailInputChange() {
  const email = inpEmail.value.trim().toLowerCase();
  if (!email) {
    clearForm();
    return;
  }

  // Buscar usuario por email
  const user = users.find(u => u.email.toLowerCase() === email);
  if (!user) {
    alert("Usuario no encontrado.");
    clearForm();
    inpEmail.value = email; // para que quede el correo escrito
    return;
  }

  // Si existe, cargar datos en el formulario
  editingUserId = user.id;
  inpEmail.disabled = true;
  roleCheckboxes.forEach(cb => {
    cb.checked = user.roles?.[cb.value] || false;
  });
  btnAddUser.textContent = "Actualizar Usuario";
}

// Eventos para el input email
inpEmail.addEventListener("change", onEmailInputChange);
inpEmail.addEventListener("keyup", (e) => {
  if (e.key === "Enter") onEmailInputChange();
});

// Botón para actualizar usuario
btnAddUser.addEventListener("click", async () => {
  const email = inpEmail.value.trim().toLowerCase();
  if (!email) {
    alert("Por favor ingresa un correo electrónico válido.");
    return;
  }

  if (!editingUserId) {
    alert("Primero selecciona un usuario existente para actualizar.");
    return;
  }

  // Obtener roles desde checkboxes
  const updatedRoles = {};
  roleCheckboxes.forEach(cb => {
    updatedRoles[cb.value] = cb.checked;
  });

  try {
    await updateDoc(doc(db, "users", editingUserId), { roles: updatedRoles });
    alert("Roles actualizados correctamente.");
    clearForm();
    await loadUsers();
  } catch (err) {
    console.error(err);
    alert("Error actualizando roles.");
  }
});

// Al iniciar, carga usuarios
loadUsers();
