// database.js
const SUPABASE_URL = "https://rqiognpfzyyfyferyjah.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaW9nbnBmenl5ZnlmZXJ5amFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzI2ODcsImV4cCI6MjA3MDMwODY4N30.srA9q_fRyWo0d4htuiC4lyrBg2j5QSABfA1yi_8MSIc";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// جلب جميع المنتجات
async function getProducts(){
  let { data, error } = await client
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if(error){
    console.error("خطأ في جلب البيانات:", error.message);
    return [];
  }

  return data.map(p=>({
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.images ? p.images.split(",") : [],
    description: p.description,
    type: p.tayp || "normal"
  }));
}

// إضافة منتج جديد
async function insertProduct(product){
  let { error } = await client
    .from("products")
    .insert([{
      name: product.name,
      price: product.price,
      images: product.images.join(","),
      description: product.description,
      tayp: product.type,
      data_added: new Date().toISOString()
    }]);

  if(error){
    console.error("خطأ في إضافة المنتج:", error.message);
  } else {
    console.log("✅ تمت إضافة المنتج بنجاح");
  }
}

// تعديل منتج
async function updateProduct(id, product){
  let { error } = await client
    .from("products")
    .update({
      name: product.name,
      price: product.price,
      images: product.images.join(","),
      description: product.description,
      tayp: product.type
    })
    .eq("id", id);

  if(error){
    console.error("خطأ في تعديل المنتج:", error.message);
  } else {
    console.log("✏️ تم تعديل المنتج بنجاح");
  }
}

// حذف منتج
async function deleteProduct(id){
  let { error } = await client
    .from("products")
    .delete()
    .eq("id", id);

  if(error){
    console.error("خطأ في حذف المنتج:", error.message);
  } else {
    console.log("🗑️ تم حذف المنتج بنجاح");
  }
}