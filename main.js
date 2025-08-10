document.getElementById("nav-home").onclick = () => {
  document.getElementById("home").style.display = "block";
  document.getElementById("offers").style.display = "none";
  setActive("nav-home");
};

document.getElementById("nav-offers").onclick = () => {
  document.getElementById("home").style.display = "none";
  document.getElementById("offers").style.display = "block";
  setActive("nav-offers");
};

document.getElementById("nav-admin").onclick = () => {
  document.getElementById("adminModal").style.display = "block";
  setActive("nav-admin");
};

function setActive(id) {
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

window.onload = () => {
  renderProducts();
  renderOffers();
  updateCartCount();
  renderCart();
};