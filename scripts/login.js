import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const btnLogin = document.getElementById('btnLogin');

// Variables en memoria (se pierden si se recarga la página)
let loginAttempts = 0;
let isLocked = false;
let unlockTimeout = null;

btnLogin.addEventListener("click", async function (event) {
    event.preventDefault();

    if (isLocked) {
        alert("Demasiados intentos fallidos. Espera 1 minuto antes de volver a intentar.");
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        loginAttempts = 0; // Reiniciar intentos al iniciar sesión
        window.location.href = "./html/dashboard.html";
    } catch (error) {
        loginAttempts++;

        if (loginAttempts >= 5) {
            isLocked = true;
            alert("Demasiados intentos fallidos. Espera 1 minuto antes de volver a intentar.");

            // Desbloquear después de 1 minuto
            unlockTimeout = setTimeout(() => {
                isLocked = false;
                loginAttempts = 0;
            }, 60 * 1000);
        } else {
            alert(`Error: ${error.message} — Intento ${loginAttempts} de 5`);
        }
    }
});
