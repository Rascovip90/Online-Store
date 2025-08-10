const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// تقديم الملفات الثابتة
app.use(express.static('.'));

// نقطة نهاية للحصول على متغير قاعدة البيانات
app.get('/get-database-url', (req, res) => {
    res.json({
        DATABASE_URL: process.env.DATABASE_URL || null,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || null
    });
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`DATABASE_URL is ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
});