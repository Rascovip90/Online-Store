document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nav-home").addEventListener("click", e => {
    e.preventDefault();
    showSection("home");
  });

  document.getElementById("nav-offers").addEventListener("click", e => {
    e.preventDefault();
    showSection("offers");
  });

  document.getElementById("nav-admin").addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("adminModal").style.display = "block";
  });

  document.getElementById("orderSticker").addEventListener("click", () => {
    document.getElementById("cartSide").classList.add("open");
  });

  document.getElementById("closeCartBtn").addEventListener("click", () => {
    document.getElementById("cartSide").classList.remove("open");
  });

  renderProducts();
  renderOffers();
});

function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => {
    sec.style.display = sec.id === id ? "block" : "none";
  });
  document.querySelectorAll("header nav a").forEach(link => {
    link.classList.toggle("active", link.id === `nav-${id}`);
  });
}