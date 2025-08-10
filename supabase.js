const SUPABASE_URL = "https://rqiognpfzyyfyferyjah.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaW9nbnBmenl5ZnlmZXJ5amFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzI2ODcsImV4cCI6MjA3MDMwODY4N30.srA9q_fRyWo0d4htuiC4lyrBg2j5QSABfA1yi_8MSIc";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// عرض الأخطاء على الشاشة
console.error = function(msg) {
    const errBox = document.createElement("div");
    errBox.style.color = "red";
    errBox.style.background = "#ffe5e5";
    errBox.style.padding = "10px";
    errBox.style.margin = "10px";
    errBox.style.border = "1px solid red";
    errBox.textContent = "خطأ: " + msg;
    document.body.appendChild(errBox);
};