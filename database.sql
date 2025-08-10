-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,3) NOT NULL,
    description TEXT,
    images TEXT[], -- مصفوفة روابط الصور
    type VARCHAR(20) DEFAULT 'normal' CHECK (type IN ('normal', 'offer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    items JSONB NOT NULL, -- تفاصيل المنتجات المطلوبة
    total_amount DECIMAL(10,3) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للاستعلامات السريعة
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- تفعيل Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمنتجات (قراءة للجميع)
CREATE POLICY IF NOT EXISTS "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- سياسات الأمان للطلبات (إدراج للجميع، قراءة محدودة)
CREATE POLICY IF NOT EXISTS "Orders are insertable by everyone" ON orders
    FOR INSERT WITH CHECK (true);

-- للإدارة فقط - تحديث وحذف المنتجات
CREATE POLICY IF NOT EXISTS "Products are editable by authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- للإدارة فقط - عرض الطلبات
CREATE POLICY IF NOT EXISTS "Orders are viewable by authenticated users" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');
