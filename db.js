// db.js
// ====== إعداد الاتصال بـ Supabase ======
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// جلب المنتجات من Supabase وعرضها
async function fetchProductsFromDB() {
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("dateAdded", { ascending: false });

    if (error) {
      console.error("خطأ في جلب البيانات:", error.message);
      return;
    }

    // تخزينها في المتغيرات العالمية للموقع
    products = data.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      images: item.images ? item.images.split(",").map(s => s.trim()) : [],
      desc: item.desc || "",
      type: item.type || "normal",
      dateAdded: item.dateAdded ? new Date(item.dateAdded).getTime() : Date.now()
    }));

    // إعادة رسم الصفحات
    renderProducts();
    renderOffers();
    renderCartViews();
  } catch (err) {
    console.error("حدث خطأ غير متوقع:", err);
  }
}

// تشغيل الجلب عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", fetchProductsFromDB);