import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const btnLogin = document.getElementById('btnLogin');

// Variables de control de intentos fallidos
let failedAttempts = 0;
let lastAttemptTime = null;

btnLogin.addEventListener("click", async function (event) {
    event.preventDefault();

    const now = Date.now();

    // Bloqueo temporal si hay demasiados intentos fallidos
    if (failedAttempts >= 5 && lastAttemptTime && now - lastAttemptTime < 60000) {
        alert("Demasiados intentos fallidos. Intenta de nuevo en 1 minuto.");
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem('userUID', user.uid);

        // Éxito: reiniciar contador de intentos fallidos
        failedAttempts = 0;
        lastAttemptTime = null;

        window.location.href = "./html/dashboard.html";
    } catch (error) {
        failedAttempts++;
        lastAttemptTime = Date.now();
        alert("Credenciales incorrectas. Intento " + failedAttempts + " de 5.");
    }
});