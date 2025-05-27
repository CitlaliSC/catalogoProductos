import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener("click", async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Obtener intentos y tiempo desde localStorage
    const attempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
    const lockoutTime = parseInt(localStorage.getItem('lockoutTime')) || 0;
    const now = Date.now();

    // Verificar si está bloqueado
    if (lockoutTime && now < lockoutTime) {
        const remaining = Math.ceil((lockoutTime - now) / 1000);
        alert(`Demasiados intentos fallidos. Inténtalo de nuevo en ${remaining} segundos.`);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem('userUID', user.uid);

        // Restablecer intentos al iniciar sesión correctamente
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');

        window.location.href = "./html/dashboard.html";
    } catch (error) {
        const errorMessage = error.message;

        const newAttempts = attempts + 1;
        localStorage.setItem('loginAttempts', newAttempts);

        if (newAttempts >= 5) {
            const lockoutDuration = 60 * 1000; // 1 minuto en milisegundos
            const unlockTime = now + lockoutDuration;
            localStorage.setItem('lockoutTime', unlockTime);
            alert("Demasiados intentos fallidos. Espera 1 minuto antes de volver a intentar.");
        } else {
            alert(`Error: ${errorMessage} — Intento ${newAttempts} de 5`);
        }
    }
});