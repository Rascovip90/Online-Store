const SUPABASE_URL = "https://rqiognpfzyyfyferyjah.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaW9nbnBmenl5ZnlmZXJ5amFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzI2ODcsImV4cCI6MjA3MDMwODY4N30.srA9q_fRyWo0d4htuiC4lyrBg2j5QSABfA1yi_8MSIc";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadProductsFromDB() {
  try {
    const { data, error } = await supabaseClient.from("products").select("*");
    if (error) throw error;
    products = data.map(row => ({
      name: row.name,
      price: parseFloat(row.price),
      images: row.images || [],
      desc: row.desc || "",
      type: row.type || "normal"
    }));
    renderProducts();
  } catch (err) {
    console.error("❌ خطأ في جلب البيانات:", err.message);
    products = [];
    renderProducts();
  }
}

async function addProductToDB(product) {
  try {
    const { error } = await supabaseClient.from("products").insert([product]);
    if (error) throw error;
    console.log("✅ تم حفظ المنتج في Supabase");
  } catch (err) {
    console.error("❌ فشل حفظ المنتج:", err.message);
  }
}

async function deleteProductFromDB(productName) {
  try {
    const { error } = await supabaseClient.from("products").delete().eq("name", productName);
    if (error) throw error;
    console.log("🗑️ تم حذف المنتج من Supabase");
  } catch (err) {
    console.error("❌ فشل حذف المنتج:", err.message);
  }
}

addProduct = async function () {
  const name = document.getElementById("prodName").value.trim();
  const price = parseFloat(document.getElementById("prodPrice").value);
  const images = document.getElementById("prodImages").value.split(",").map(s => s.trim()).filter(s => s);
  const desc = document.getElementById("prodDesc").value.trim();
  const type = document.getElementById("prodType").value;
  if (!name || isNaN(price) || !images.length) return alert("الرجاء إدخال بيانات صحيحة");
  const newProduct = { name, price, images, desc, type };
  products.push(newProduct);
  renderProducts();
  renderAdminList();
  await addProductToDB(newProduct);
};

deleteProduct = async function (index) {
  const productName = products[index].name;
  products.splice(index, 1);
  renderProducts();
  renderAdminList();
  await deleteProductFromDB(productName);
};

loadProductsFromDB();