let isAdmin = false;

function closeAdmin() {
  document.getElementById("adminModal").style.display = "none";
}

function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "7732") {
    isAdmin = true;
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("controlPanel").style.display = "block";
    renderAdminList();
  } else {
    alert("كلمة المرور غير صحيحة");
  }
}

async function addProduct() {
  if (!isAdmin) return;

  const name = document.getElementById("prodName").value;
  const price = parseFloat(document.getElementById("prodPrice").value);
  const imagesInput = document.getElementById("prodImages").value;
  const desc = document.getElementById("prodDesc").value;
  const type = document.getElementById("prodType").value;
  const images = imagesInput.split(",").map(i => i.trim()).filter(i => i);

  const { error } = await supabaseClient.from("products").insert([{
    Name: name,
    Price: price,
    Images: images.join(","), // تخزين كنص
    description: desc,
    Tayp: type,
    "data added": new Date().toISOString()
  }]);

  if (error) {
    alert("❌ خطأ أثناء الإضافة: " + error.message);
    const errBox = document.createElement("div");
    errBox.style.color = "red";
    errBox.style.padding = "10px";
    errBox.textContent = "خطأ: " + error.message;
    document.body.appendChild(errBox);
    return;
  }

  alert("✅ تمت الإضافة بنجاح");
  renderProducts();
  renderOffers();
  renderAdminList();
}

async function renderAdminList() {
  const list = document.getElementById("adminList");
  list.innerHTML = "";
  const products = await fetchProducts();
  products.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.ID} - ${p.Name} (${p.Tayp})`;
    list.appendChild(div);
  });
}