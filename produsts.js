async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("data added", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }
  return data;
}

async function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  const products = await fetchProducts();
  products
    .filter(p => p.Tayp === "normal")
    .forEach(p => grid.appendChild(createProductCard(p)));
}

async function renderOffers() {
  const grid = document.getElementById("offersGrid");
  grid.innerHTML = "";
  const products = await fetchProducts();
  products
    .filter(p => p.Tayp === "offer")
    .forEach(p => grid.appendChild(createProductCard(p)));
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const img = document.createElement("img");
  img.src = product.Images.includes(",") ? product.Images.split(",")[0] : product.Images;
  img.alt = product.Name;

  const details = document.createElement("div");
  details.className = "details";

  const title = document.createElement("h3");
  title.textContent = product.Name;

  const desc = document.createElement("p");
  desc.textContent = product.description || "";

  const price = document.createElement("strong");
  price.textContent = `${product.Price} ر.ع`;

  const btn = document.createElement("button");
  btn.textContent = "أضف للسلة";
  btn.onclick = () => addToCart(product);

  details.appendChild(title);
  details.appendChild(desc);
  details.appendChild(price);
  details.appendChild(btn);

  card.appendChild(img);
  card.appendChild(details);
  return card;
}