import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

import { firebaseConfig } from "./firebaseConfig.js";
import { setupLogout } from "./logout.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let allProducts = [];
let currentUser = null;

async function getProductsFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    allProducts = [];
    querySnapshot.forEach((docSnap) => {
      allProducts.push({ id: docSnap.id, ...docSnap.data() });
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
  }
}

function renderProducts(products) {
  const container = document.getElementById("productsGrid");
  if (!container) {
    console.error("No se encontró el contenedor con ID 'productsGrid'");
    return;
  }
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: white;">No se encontraron productos.</p>`;
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
      <img src="${product.imagen || 'https://via.placeholder.com/200x200?text=Sin+Imagen'}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p><strong>Marca:</strong> ${product.marca}</p>
        <p><strong>Categoría:</strong> ${product.categoria}</p>
        <p><strong>Precio:</strong> $${product.precio}</p>
        <p><strong>Tallas:</strong> ${product.tallas ? product.tallas.join(", ") : "No especificadas"}</p>
        <button class="add-to-wishlist-btn">Agregar a wishlist</button>
      </div>
    `;

    container.appendChild(productCard);

    const btn = productCard.querySelector(".add-to-wishlist-btn");
    btn.addEventListener("click", () => addToWishlist(product));
  });
}

function filterProducts(filters) {
  const lowerSearch = filters.search.toLowerCase();

  return allProducts.filter(product => {
    const matchSearch =
      product.name.toLowerCase().includes(lowerSearch) ||
      product.marca.toLowerCase().includes(lowerSearch) ||
      product.categoria.toLowerCase().includes(lowerSearch);

    const matchMarca = !filters.marca || product.marca === filters.marca;
    const matchCategoria = !filters.categoria || product.categoria === filters.categoria;
    const matchPrecio = product.precio <= filters.precioMax;

    return matchSearch && matchMarca && matchCategoria && matchPrecio;
  });
}

// Funciones Wishlist

async function addToWishlist(product) {
  if (!currentUser) {
    alert("Debes iniciar sesión para usar la wishlist.");
    return;
  }
  try {
    const wishlistDocRef = doc(db, "users", currentUser.uid, "wishlist", product.id);
    await setDoc(wishlistDocRef, product);
    alert(`Agregado a wishlist: ${product.name}`);
    loadWishlistCount();
  } catch (error) {
    console.error("Error agregando a wishlist:", error);
  }
}

async function openWishlist() {
  if (!currentUser) {
    alert("Debes iniciar sesión para ver tu wishlist.");
    return;
  }

  const wishlistModal = document.getElementById("wishlistModal");
  const wishlistItemsContainer = document.getElementById("wishlistItems");
  wishlistItemsContainer.innerHTML = "Cargando...";

  try {
    const wishlistSnapshot = await getDocs(collection(db, "users", currentUser.uid, "wishlist"));
    wishlistItemsContainer.innerHTML = "";

    if (wishlistSnapshot.empty) {
      wishlistItemsContainer.innerHTML = "<p>Tu wishlist está vacía.</p>";
      wishlistModal.style.display = "block";
      return;
    }

    wishlistSnapshot.forEach(docSnap => {
      const p = docSnap.data();
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("wishlist-item");
      itemDiv.innerHTML = `
        <img src="${p.imagen || 'https://via.placeholder.com/50'}" alt="${p.name}" />
        <div>
          <h4>${p.name}</h4>
          <p><strong>Precio:</strong> $${p.precio}</p>
          <button class="remove-wishlist-btn" data-id="${p.id}">Eliminar</button>
        </div>
      `;
      wishlistItemsContainer.appendChild(itemDiv);

      itemDiv.querySelector(".remove-wishlist-btn").addEventListener("click", () => {
        removeFromWishlist(p.id);
      });
    });

    wishlistModal.style.display = "block";
  } catch (error) {
    console.error("Error cargando wishlist:", error);
  }
}

function closeWishlist() {
  document.getElementById("wishlistModal").style.display = "none";
}

async function removeFromWishlist(productId) {
  if (!currentUser) return;
  try {
    await deleteDoc(doc(db, "users", currentUser.uid, "wishlist", productId));
    alert("Producto eliminado de wishlist.");
    openWishlist(); // recarga la lista
    loadWishlistCount();
  } catch (error) {
    console.error("Error eliminando producto de wishlist:", error);
  }
}

async function loadWishlistCount() {
  if (!currentUser) {
    updateWishlistCount(0);
    return;
  }
  try {
    const wishlistSnapshot = await getDocs(collection(db, "users", currentUser.uid, "wishlist"));
    updateWishlistCount(wishlistSnapshot.size);
  } catch (error) {
    console.error("Error contando wishlist:", error);
  }
}

function updateWishlistCount(count) {
  const countSpan = document.getElementById("wishlistCount");
  if (countSpan) countSpan.textContent = count;
}

document.addEventListener("DOMContentLoaded", async () => {
  const filtroMarca = document.getElementById("inpMarca");
  const filtroCategoria = document.getElementById("inpCategory");
  const filtroPrecio = document.getElementById("inpPrecio");
  const filtroBusqueda = document.getElementById("searchInput");
  const precioValor = document.getElementById("precioValor");

  // Detectar usuario autenticado
  onAuthStateChanged(auth, user => {
    currentUser = user;
    loadWishlistCount();
  });

  await getProductsFromFirestore();

  function updatePrecioValor() {
    if (!precioValor || !filtroPrecio) return;
    precioValor.textContent = `$0 - $${filtroPrecio.value}`;
  }

  function updateFilteredProducts() {
    const filters = {
      search: filtroBusqueda ? filtroBusqueda.value.trim() : "",
      marca: filtroMarca ? filtroMarca.value : "",
      categoria: filtroCategoria ? filtroCategoria.value : "",
      precioMax: filtroPrecio ? parseFloat(filtroPrecio.value) : Number.MAX_VALUE,
    };

    updatePrecioValor();

    const filtered = filterProducts(filters);
    renderProducts(filtered);
  }

  if (filtroMarca) filtroMarca.addEventListener("change", updateFilteredProducts);
  if (filtroCategoria) filtroCategoria.addEventListener("change", updateFilteredProducts);
  if (filtroPrecio) filtroPrecio.addEventListener("input", updateFilteredProducts);
  if (filtroBusqueda) filtroBusqueda.addEventListener("input", updateFilteredProducts);

  // Botón wishlist abre modal
  const wishlistBtn = document.querySelector(".wishlist-btn");
  if (wishlistBtn) wishlistBtn.addEventListener("click", openWishlist);

  // Botón cerrar modal wishlist
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeWishlist);

  updatePrecioValor();
  renderProducts(allProducts);
});
setupLogout();
