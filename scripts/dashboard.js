import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js";
import { setupLogout } from "./logout.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const contenedor = document.getElementById("opciones-usuario");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      contenedor.innerHTML = "<p>No se encontraron roles para este usuario.</p>";
      return;
    }

    const roles = userDoc.data().roles || {};

    // Siempre mostrar catálogo (rol por defecto)
    crearBoton("Ir al Catálogo", "./catalogue.html");

    if (roles.adminProductos) {
      crearBoton("Administrar Productos", "./adminProduct.html");
    }

    if (roles.adminUsuarios) {
      crearBoton("Administrar Usuarios", "./adminUsers.html");
    }

  } catch (err) {
    console.error("Error obteniendo roles:", err);
    contenedor.innerHTML = "<p>Ocurrió un error al cargar las opciones.</p>";
  }
});

function crearBoton(texto, enlace) {
  const btn = document.createElement("button");
  btn.textContent = texto;
  btn.onclick = () => {
    window.location.href = enlace;
  };
  btn.style.margin = "10px";
  btn.style.padding = "10px 20px";
  btn.style.fontSize = "1rem";
  btn.style.cursor = "pointer";
  contenedor.appendChild(btn);
}
setupLogout();