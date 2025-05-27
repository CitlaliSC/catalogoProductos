// load_products.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Guardar producto (documento) en colección 'products'
export async function saveProductToFirestore(product) {
  try {
    await setDoc(doc(db, "products", product.id), product);
  } catch (error) {
    console.error("Error guardando producto:", error);
  }
}

// Eliminar producto por id
export async function deleteProductFromFirestore(productID) {
  try {
    await deleteDoc(doc(db, "products", productID));
  } catch (error) {
    console.error("Error eliminando producto:", error);
  }
}

// Obtener todos los productos
export async function getProductsFromFirestore() {
  const productsArray = [];
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      productsArray.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
  }
  return productsArray;
}

window.onerror = function(message, source, lineno, colno, error) {
    // No imprimes el error en la consola
    // Puedes agregar tu lógica de manejo de errores aquí, como registrarlo en un servidor
    // o simplemente ignorarlo.
    return false; // Esto indica que el error fue manejado y no debe ser impreso en la consola
};