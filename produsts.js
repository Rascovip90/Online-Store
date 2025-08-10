async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("date_added", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

async function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  const products = await fetchProducts();
  products
    .filter(p => p.type === "normal")
    .forEach(p => grid.appendChild(createProductCard(p)));
}

async function renderOffers() {
  const grid = document.getElementById("offersGrid");
  grid.innerHTML = "";
  const products = await fetchProducts();
  products
    .filter(p => p.type === "offer")
    .forEach(p => grid.appendChild(createProductCard(p)));
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const img = document.createElement("img");
  img.src = product.images[0];
  img.alt = product.name;

  const details = document.createElement("div");
  details.className = "details";

  const title = document.createElement("h3");
  title.textContent = product.name;

  const desc = document.createElement("p");
  desc.textContent = product.description;

  const price = document.createElement("strong");
  price.textContent = `${product.price} .`;

  const btn = document.createElement("button");
  btn.textContent = " ";
  btn.onclick = () => addToCart(product);

  details.appendChild(title);
  details.appendChild(desc);
  details.appendChild(price);
  details.appendChild(btn);

  card.appendChild(img);
  card.appendChild(details);
  return card;
}