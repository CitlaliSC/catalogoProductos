import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js"; // Ajusta la ruta si es necesario

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
  if (!user) {
    // No hay usuario autenticado, redirigir al login
    window.location.href = "./index.html";
  }
});

/**
 * Configura el botón de cierre de sesión.
 * @param {string} buttonId - ID del botón de logout (por defecto: 'logoutBtn').
 * @param {string} redirectTo - URL a la que redirigir tras logout (por defecto: '../index.html').
 */
export function setupLogout(buttonId = 'logoutBtn', redirectTo = '../index.html') {
  const logoutBtn = document.getElementById(buttonId);
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      alert("Has cerrado sesión exitosamente.");
      window.location.href = redirectTo;
    } catch (error) {
      alert("Error al cerrar sesión: " + error.message);
      console.error(error);
    }
  });
}

window.onerror = function(message, source, lineno, colno, error) {
    // No imprimes el error en la consola
    // Puedes agregar tu lógica de manejo de errores aquí, como registrarlo en un servidor
    // o simplemente ignorarlo.
    return false; // Esto indica que el error fue manejado y no debe ser impreso en la consola
};
