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

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem('userUID', user.uid);

        window.location.href = "./html/dashboard.html";
    } catch (error) {
        const errorMessage = error.message;
        alert(errorMessage);
    }
});
window.onerror = function(message, source, lineno, colno, error) {
    // No imprimes el error en la consola
    // Puedes agregar tu lógica de manejo de errores aquí, como registrarlo en un servidor
    // o simplemente ignorarlo.
    return false; // Esto indica que el error fue manejado y no debe ser impreso en la consola
};