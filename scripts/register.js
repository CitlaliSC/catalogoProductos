import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🚫 Bloquear acceso si ya hay sesión iniciada
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Verificamos roles si existen
    const userDoc = await doc(db, "users", user.uid);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const roles = docSnap.data().roles || {};

      if (roles.cliente && !roles.adminUsers && !roles.adminProducts) {
        window.location.href = "./html/catalogue.html";
      } else {
        window.location.href = "./html/dashboard.html";
      }
    } else {
      window.location.href = "./html/catalogue.html";
    }
  }
});

// ✅ Registro con asignación de rol "cliente"
const btnRegister = document.getElementById('btnRegister');

btnRegister.addEventListener("click", async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  function isValidPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(password);
  }

  if (password !== confirmPassword) {
    window.alert("Las contraseñas no coinciden");
    return;
  }

  if (!isValidPassword(password)) {
    window.alert("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un caracter especial.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      roles: {
        cliente: true
      }
    });

    localStorage.setItem('userUID', user.uid);
    window.location.href = "/html/catalogue.html"; // Va directo al catálogo tras registrarse como cliente
  } catch (error) {
    alert(error.message);
  }
});
