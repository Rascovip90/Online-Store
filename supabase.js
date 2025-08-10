// ضع الرابط والمفتاح كما أعطيتني (مباشر داخل الكود)
const SUPABASE_URL = "https://rqiognpfzyyfyferyjah.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaW9nbnBmenl5ZnlmZXJ5amFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzI2ODcsImV4cCI6MjA3MDMwODY4N30.srA9q_fRyWo0d4htuiC4lyrBg2j5QSABfA1yi_8MSIc";

// انشاء العميل ووضعه على نافذة global حتى باقي السكربتات تستخدمه
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);