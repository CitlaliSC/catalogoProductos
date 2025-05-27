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
const searchUserInput = document.getElementById("searchUserInput");

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
  renderUserList(users);
  clearForm();
}

// Renderiza la lista de usuarios (puede recibir lista filtrada)
function renderUserList(usersToRender) {
  if (!usersToRender || usersToRender.length === 0) {
    userListDiv.innerHTML = "<p>No hay usuarios registrados.</p>";
    return;
  }

  userListDiv.innerHTML = "";

  usersToRender.forEach(user => {
    const userDiv = document.createElement("div");
    userDiv.className = "user-item";
    userDiv.style.border = "1px solid #ccc";
    userDiv.style.marginBottom = "10px";
    userDiv.style.padding = "10px";
    userDiv.style.backgroundColor = "#f9f9f9";

    // Mostrar roles en texto legible
    const rolesList = user.roles 
      ? Object.entries(user.roles)
          .filter(([_, hasRole]) => hasRole)
          .map(([role]) => role)
          .join(", ")
      : "Ninguno";

    userDiv.innerHTML = `
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Roles:</strong> ${rolesList}</p>
      <button class="edit-user-btn" data-userid="${user.id}">Editar</button>
      <button class="delete-user-btn" data-userid="${user.id}" style="margin-left:10px; background-color:#d9534f; color:white;">Eliminar</button>
    `;

    userListDiv.appendChild(userDiv);
  });

  // Eventos botones Editar
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

  // Eventos botones Eliminar
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

// Limpiar formulario
function clearForm() {
  editingUserId = null;
  inpEmail.value = "";
  inpEmail.disabled = false;
  roleCheckboxes.forEach(cb => (cb.checked = false));
  btnAddUser.textContent = "Actualizar Usuario";
}

// Manejar cambio o enter en input email (para cargar usuario)
function onEmailInputChange() {
  const email = inpEmail.value.trim().toLowerCase();
  if (!email) {
    clearForm();
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === email);
  if (!user) {
    alert("Usuario no encontrado.");
    clearForm();
    inpEmail.value = email; 
    return;
  }

  editingUserId = user.id;
  inpEmail.disabled = true;
  roleCheckboxes.forEach(cb => {
    cb.checked = user.roles?.[cb.value] || false;
  });
  btnAddUser.textContent = "Actualizar Usuario";
}

// Filtrar usuarios dinámicamente según texto búsqueda
function filterUsers() {
  const query = searchUserInput.value.trim().toLowerCase();
  if (!query) {
    renderUserList(users);
    return;
  }

  const filtered = users.filter(u => u.email.toLowerCase().includes(query));
  renderUserList(filtered);
}

// Eventos input email
inpEmail.addEventListener("change", onEmailInputChange);
inpEmail.addEventListener("keyup", (e) => {
  if (e.key === "Enter") onEmailInputChange();
});

// Evento input búsqueda usuarios
searchUserInput.addEventListener("input", filterUsers);

// Botón actualizar usuario
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

// Cargar usuarios al iniciar
loadUsers();
