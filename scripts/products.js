import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  getProductsFromFirestore
} from "./loadProducts.js";

const inpName        = document.getElementById("inpName");
const inpMarca       = document.getElementById("inpMarca");
const inpCategory    = document.getElementById("inpCategory");
const inpPrecio      = document.getElementById("inpPrecio");
const sizeCheckboxes = document.querySelectorAll(".size-checkbox");

const btnAdd      = document.getElementById("btnAdd");
const productList = document.getElementById("productList");

let editingProductId = null;

btnAdd.onclick = async () => {
  if (!inpName.value || !inpMarca.value || !inpCategory.value || !inpPrecio.value) {
    return alert("Completa todos los campos.");
  }

  if (!navigator.onLine) {
    return alert("No hay conexión a internet. No se puede guardar el producto.");
  }

  if (editingProductId) {
    await updateProduct();
  } else {
    await createProduct();
  }
  await displayProducts();
};

async function createProduct() {
  const id = `prod_${Date.now()}`;

  const tallas = [...sizeCheckboxes]
    .filter(cb => cb.checked)
    .map(cb   => cb.value);

  const product = {
    id,
    name:      inpName.value,
    marca:     inpMarca.value,
    categoria: inpCategory.value,
    precio:    parseFloat(inpPrecio.value),
    tallas
  };

  try {
    await saveProductToFirestore(product);
    clearInputs();
  } catch (error) {
    alert("Error al guardar el producto.");
    console.error(error);
  }
}

async function updateProduct() {
  const tallas = [...sizeCheckboxes]
    .filter(cb => cb.checked)
    .map(cb   => cb.value);

  const product = {
    id: editingProductId,
    name:      inpName.value,
    marca:     inpMarca.value,
    categoria: inpCategory.value,
    precio:    parseFloat(inpPrecio.value),
    tallas
  };

  try {
    await saveProductToFirestore(product);
    clearInputs();
    editingProductId = null;
    btnAdd.textContent = "Agregar Producto";
  } catch (error) {
    alert("Error al actualizar el producto.");
    console.error(error);
  }
}

async function deleteProduct(prodID) {
  if (!navigator.onLine) {
    return alert("No hay conexión a internet. No se puede eliminar el producto.");
  }

  try {
    await deleteProductFromFirestore(prodID);
    await displayProducts();
  } catch (error) {
    alert("Error al eliminar el producto.");
    console.error(error);
  }
}

function clearInputs() {
  inpName.value = inpMarca.value = inpCategory.value = inpPrecio.value = "";
  sizeCheckboxes.forEach(cb => (cb.checked = false));
  inpName.focus();
}

function fillFormForEdit(product) {
  inpName.value = product.name;
  inpMarca.value = product.marca;
  inpCategory.value = product.categoria;
  inpPrecio.value = product.precio;
  sizeCheckboxes.forEach(cb => (cb.checked = product.tallas?.includes(cb.value) ?? false));
  btnAdd.textContent = "Guardar Cambios";
  editingProductId = product.id;
}

async function displayProducts() {
  productList.innerHTML = "";  // Limpia antes

  try {
    const productsArray = await getProductsFromFirestore();
    console.log("Productos obtenidos:", productsArray);

    if (!productsArray.length) {
      productList.innerHTML = "<p>No hay productos para mostrar.</p>";
      return;
    }

    productsArray.forEach((p) => {
      console.log("Producto:", p);
      const card = document.createElement("div");
      card.className = "product-card";
      card.style.padding = "5%";
      card.style.color = "black";
      card.innerHTML = `
        <h3>${p.name}</h3>
        <p style="color: black;"><strong>Marca:</strong> ${p.marca}</p>
        <p style="color: black;"><strong>Categoría:</strong> ${p.categoria}</p>
        <p style="color: black;"><strong>Precio:</strong> $${p.precio.toFixed(2)}</p>
        <p style="color: black;"><strong>Tallas:</strong> ${p.tallas?.join(", ") || "-"}</p>
        <button class="btnEdit" data-id="${p.id}">Editar</button>
        <button class="btnDelete" data-id="${p.id}">Eliminar</button>
      `;
      productList.appendChild(card);
    });

    // Añade listeners para botones
    document.querySelectorAll(".btnDelete").forEach(btn =>
      btn.addEventListener("click", e => deleteProduct(e.target.dataset.id))
    );
    document.querySelectorAll(".btnEdit").forEach(btn =>
      btn.addEventListener("click", e => {
        const productId = e.target.dataset.id;
        const product = productsArray.find(p => p.id === productId);
        if (product) fillFormForEdit(product);
      })
    );

  } catch (error) {
    productList.innerHTML = "<p>Error cargando productos.</p>";
    console.error(error);
  }
}



window.onload = async () => {
  if (!navigator.onLine) {
    alert("No hay conexión a internet. No se pueden cargar los productos.");
    productList.innerHTML = "<p>Sin conexión, no se pueden mostrar productos.</p>";
    return;
  }
  await displayProducts();
};