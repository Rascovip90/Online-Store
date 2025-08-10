// إعدادات Supabase مع استخدام متغير البيئة
const getDatabaseConfig = async () => {
    try {
        // محاولة الحصول على DATABASE_URL من الخادم
        const response = await fetch('/get-database-url');
        if (response.ok) {
            const data = await response.json();
            const dbUrl = data.DATABASE_URL;
            
            if (!dbUrl) {
                console.error('DATABASE_URL not found in server response');
                return null;
            }
            
            // استخراج معلومات الاتصال من DATABASE_URL
            const url = new URL(dbUrl);
            const projectId = url.hostname.split('.')[0];
            const supabaseUrl = `https://${projectId}.supabase.co`;
            
            // المفتاح العام (anon key) - يحتاج للحصول عليه من dashboard Supabase
            const supabaseKey = data.SUPABASE_ANON_KEY || 
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.example';
            
            return { url: supabaseUrl, key: supabaseKey };
        }
    } catch (error) {
        console.warn('Could not fetch DATABASE_URL from server:', error);
    }
    
    return null;
};

// إنشاء اتصال بـ Supabase أو استخدام التخزين المحلي كبديل
let supabase = null;
let useLocalStorage = false;

const initializeDatabase = async () => {
    const config = await getDatabaseConfig();
    
    if (config && window.supabase) {
        try {
            supabase = window.supabase.createClient(config.url, config.key);
            console.log('Supabase client initialized successfully');
            console.log('Connected to:', config.url);
        } catch (error) {
            console.warn('Failed to initialize Supabase, using local storage:', error);
            useLocalStorage = true;
        }
    } else {
        console.warn('Using local storage for data persistence');
        useLocalStorage = true;
    }
};

// متغيرات عامة
const ADMIN_PASS = '7732';
const PRODUCTS_KEY = 'my_products_v3';
const CART_KEY = 'my_cart_v3';
let products = [];
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
let isLoading = false;

// عناصر DOM
const productsGrid = document.getElementById('productsGrid');
const offersGrid = document.getElementById('offersGrid');
const cartSide = document.getElementById('cartSide');
const sideItems = document.getElementById('sideItems');
const adminModal = document.getElementById('adminModal');
const loadingIndicator = document.getElementById('loadingIndicator');

// وظائف التحميل والرسائل
function showLoading() {
    isLoading = true;
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoading() {
    isLoading = false;
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function showMessage(message, type = 'error') {
    // إزالة الرسائل السابقة
    const existingMessages = document.querySelectorAll('.status-message');
    existingMessages.forEach(msg => msg.remove());
    
    // إنشاء رسالة جديدة
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // إظهار الرسالة
    setTimeout(() => messageDiv.classList.add('show'), 100);
    
    // إخفاء الرسالة بعد 3 ثوان
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
    
    console.log(`${type.toUpperCase()}: ${message}`);
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

// تحميل المنتجات
async function loadProducts() {
    try {
        showLoading();
        
        if (useLocalStorage || !supabase) {
            // استخدام التخزين المحلي
            const localProducts = localStorage.getItem(PRODUCTS_KEY);
            products = localProducts ? JSON.parse(localProducts) : getDefaultProducts();
            if (products.length === 0) {
                products = getDefaultProducts();
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            }
        } else {
            // استخدام Supabase
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    // إذا كان الجدول غير موجود، استخدم التخزين المحلي
                    if (error.code === '42P01' || error.code === '42703') {
                        console.warn('Products table not found in Supabase, using local storage');
                        useLocalStorage = true;
                        const localProducts = localStorage.getItem(PRODUCTS_KEY);
                        products = localProducts ? JSON.parse(localProducts) : getDefaultProducts();
                        if (products.length === 0) {
                            products = getDefaultProducts();
                            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
                        }
                    } else {
                        throw error;
                    }
                } else {
                    products = data || [];
                    
                    // إذا لم توجد منتجات، إضافة منتجات افتراضية
                    if (products.length === 0) {
                        await addDefaultProducts();
                    }
                }
            } catch (dbError) {
                console.warn('Supabase error, falling back to local storage:', dbError);
                useLocalStorage = true;
                const localProducts = localStorage.getItem(PRODUCTS_KEY);
                products = localProducts ? JSON.parse(localProducts) : getDefaultProducts();
                if (products.length === 0) {
                    products = getDefaultProducts();
                    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
                }
            }
        }
        
        renderProducts();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('فشل في تحميل المنتجات: ' + error.message);
        console.error('Error loading products:', error);
        
        // التبديل للتخزين المحلي في حالة الفشل
        useLocalStorage = true;
        products = getDefaultProducts();
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        renderProducts();
    }
}

// منتجات افتراضية
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: 'منتج تجريبي 1',
            price: 15.5,
            description: 'وصف المنتج التجريبي الأول',
            images: ['https://via.placeholder.com/300x300?text=منتج+1'],
            type: 'normal',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            name: 'عرض خاص',
            price: 25.0,
            description: 'منتج بعرض خاص محدود',
            images: ['https://via.placeholder.com/300x300?text=عرض+خاص'],
            type: 'offer',
            created_at: new Date().toISOString()
        }
    ];
}

// إضافة منتجات افتراضية لقاعدة البيانات
async function addDefaultProducts() {
    if (useLocalStorage || !supabase) return;
    
    const defaultProducts = getDefaultProducts();
    
    for (const product of defaultProducts) {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    images: product.images,
                    type: product.type
                }])
                .select()
                .single();

            if (!error && data) {
                products.push(data);
            }
        } catch (error) {
            console.log('Error adding default product:', error);
        }
    }
}

// عرض المنتجات
function renderProducts() {
    const normalProducts = products.filter(p => p.type === 'normal');
    const offerProducts = products.filter(p => p.type === 'offer');

    if (productsGrid) {
        productsGrid.innerHTML = normalProducts.map(createProductCard).join('');
    }
    if (offersGrid) {
        offersGrid.innerHTML = offerProducts.map(createProductCard).join('');
    }
}

// إنشاء بطاقة منتج
function createProductCard(product) {
    const images = product.images || [];
    const mainImage = images[0] || 'https://via.placeholder.com/150x150?text=لا+توجد+صورة';
    
    return `
        <div class="card">
            ${product.type === 'offer' ? '<div class="badge-new">عرض</div>' : ''}
            <div class="main-img" style="height:120px;overflow:hidden;border-radius:8px;margin-bottom:8px;cursor:pointer;" 
                 onclick="openImageViewer(${product.id}, 0)">
                <img src="${mainImage}" alt="${product.name}" 
                     style="width:100%;height:100%;object-fit:cover;"
                     onerror="this.src='https://via.placeholder.com/150x150?text=صورة+غير+متاحة'">
            </div>
            ${images.length > 1 ? `
                <div style="display:flex;gap:4px;justify-content:center;margin-bottom:8px;">
                    ${images.slice(0, 4).map((img, idx) => `
                        <div class="thumb" style="width:32px;height:24px;overflow:hidden;border-radius:4px;cursor:pointer;border:1px solid #ddd;"
                             onclick="openImageViewer(${product.id}, ${idx})">
                            <img src="${img}" style="width:100%;height:100%;object-fit:cover;"
                                 onerror="this.style.display='none'">
                        </div>
                    `).join('')}
                    ${images.length > 4 ? `<div style="font-size:10px;color:#666;">+${images.length - 4}</div>` : ''}
                </div>
            ` : ''}
            <h4>${product.name}</h4>
            <p class="desc">${product.description || ''}</p>
            <p class="price">${product.price} ريال عماني</p>
            <button class="add-btn" onclick="addToCart(${product.id})">إضافة للسلة</button>
        </div>
    `;
}

// إضافة منتج جديد
async function addProduct() {
    const name = document.getElementById('prodName').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const imagesStr = document.getElementById('prodImages').value.trim();
    const description = document.getElementById('prodDesc').value.trim();
    const type = document.getElementById('prodType').value;

    if (!name || !price || price <= 0) {
        showError('يرجى إدخال اسم المنتج والسعر');
        return;
    }

    const images = imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(url => url) : [];

    try {
        showLoading();
        
        let newProduct;
        
        if (useLocalStorage || !supabase) {
            // استخدام التخزين المحلي
            newProduct = {
                id: Date.now(), // معرف بسيط باستخدام الوقت
                name,
                price,
                description: description || null,
                images,
                type,
                created_at: new Date().toISOString()
            };
            
            products.unshift(newProduct);
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        } else {
            // استخدام Supabase
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name,
                    price,
                    description: description || null,
                    images,
                    type
                }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            newProduct = data;
            products.unshift(newProduct);
        }

        renderProducts();
        renderAdminList();

        // مسح النموذج
        document.getElementById('prodName').value = '';
        document.getElementById('prodPrice').value = '';
        document.getElementById('prodImages').value = '';
        document.getElementById('prodDesc').value = '';
        document.getElementById('prodType').value = 'normal';

        hideLoading();
        showSuccess('تم إضافة المنتج بنجاح');
    } catch (error) {
        hideLoading();
        showError('فشل في إضافة المنتج: ' + error.message);
        console.error('Error adding product:', error);
    }
}

// حذف منتج
async function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        return;
    }

    try {
        showLoading();
        
        if (useLocalStorage || !supabase) {
            // استخدام التخزين المحلي
            products = products.filter(p => p.id !== id);
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        } else {
            // استخدام Supabase
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            products = products.filter(p => p.id !== id);
        }

        renderProducts();
        renderAdminList();

        hideLoading();
        showSuccess('تم حذف المنتج بنجاح');
    } catch (error) {
        hideLoading();
        showError('فشل في حذف المنتج: ' + error.message);
        console.error('Error deleting product:', error);
    }
}

// إضافة للسلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showCartIndicator();
}

// حفظ السلة محلياً
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// تحديث واجهة السلة
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // تحديث عداد السلة
    const stickerCount = document.getElementById('stickerCount');
    const sideTotalHead = document.getElementById('sideTotalHead');

    if (stickerCount) {
        if (totalItems > 0) {
            stickerCount.textContent = totalItems;
            stickerCount.style.display = 'block';
        } else {
            stickerCount.style.display = 'none';
        }
    }

    if (sideTotalHead) {
        sideTotalHead.textContent = `${totalPrice.toFixed(3)} ريال عماني`;
    }

    // عرض عناصر السلة
    renderCartItems();
}

// عرض عناصر السلة
function renderCartItems() {
    if (!sideItems) return;
    
    if (cart.length === 0) {
        sideItems.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">السلة فارغة</div>';
        return;
    }

    sideItems.innerHTML = cart.map(item => `
        <div class="item">
            <img src="${item.image || 'https://via.placeholder.com/48x48?text=صورة'}" alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/48x48?text=صورة'">
            <div class="meta">
                <div class="name">${item.name}</div>
                <div class="sub">${item.price} ريال × ${item.quantity}</div>
            </div>
            <div class="qty">
                <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">حذف</button>
        </div>
    `).join('');
}

// تحديث كمية عنصر في السلة
function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

// إزالة من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// إرسال الطلب عبر واتساب وحفظه في قاعدة البيانات
async function sendOrder() {
    if (cart.length === 0) {
        showError('السلة فارغة');
        return;
    }

    const customerName = prompt('الاسم (اختياري):') || '';
    const customerPhone = prompt('رقم الهاتف (اختياري):') || '';

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        showLoading();
        
        let orderId = Date.now(); // معرف افتراضي
        
        if (!useLocalStorage && supabase) {
            // حفظ الطلب في قاعدة البيانات
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: customerName || null,
                    customer_phone: customerPhone || null,
                    items: cart,
                    total_amount: totalAmount
                }])
                .select()
                .single();

            if (error) {
                console.warn('Failed to save order to database:', error);
            } else {
                orderId = data.id;
            }
        }

        // إنشاء رسالة واتساب
        const orderText = cart.map(item => 
            `• ${item.name} - ${item.quantity} × ${item.price} = ${(item.quantity * item.price).toFixed(3)} ريال`
        ).join('\n');

        const message = `طلب جديد من المتجر الإلكتروني:\n\n` +
            `رقم الطلب: ${orderId}\n` +
            (customerName ? `الاسم: ${customerName}\n` : '') +
            (customerPhone ? `الهاتف: ${customerPhone}\n` : '') +
            `\nتفاصيل الطلب:\n${orderText}\n\n` +
            `الإجمالي: ${totalAmount.toFixed(3)} ريال عماني`;

        const whatsappUrl = `https://wa.me/96877324648?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // مسح السلة
        cart = [];
        saveCart();
        updateCartUI();
        closeCart();

        hideLoading();
        showSuccess('تم إرسال الطلب بنجاح');
    } catch (error) {
        hideLoading();
        showError('فشل في معالجة الطلب: ' + error.message);
        console.error('Error processing order:', error);
    }
}

// إدارة لوحة التحكم
function openAdmin() {
    if (adminModal) {
        adminModal.style.display = 'flex';
        const loginPanel = document.getElementById('loginPanel');
        const controlPanel = document.getElementById('controlPanel');
        if (loginPanel) loginPanel.style.display = 'flex';
        if (controlPanel) controlPanel.style.display = 'none';
    }
}

function closeAdmin() {
    if (adminModal) {
        adminModal.style.display = 'none';
        const adminPass = document.getElementById('adminPass');
        if (adminPass) adminPass.value = '';
    }
}

function adminLogin() {
    const adminPassEl = document.getElementById('adminPass');
    if (!adminPassEl) return;
    
    const password = adminPassEl.value;
    if (password === ADMIN_PASS) {
        const loginPanel = document.getElementById('loginPanel');
        const controlPanel = document.getElementById('controlPanel');
        if (loginPanel) loginPanel.style.display = 'none';
        if (controlPanel) controlPanel.style.display = 'block';
        renderAdminList();
    } else {
        showError('كلمة مرور خاطئة');
    }
}

function renderAdminList() {
    const adminList = document.getElementById('adminList');
    if (!adminList) return;
    
    adminList.innerHTML = products.map(product => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee;">
            <div>
                <div style="font-weight:bold;font-size:12px;">${product.name}</div>
                <div style="font-size:10px;color:#666;">${product.price} ريال - ${product.type === 'offer' ? 'عرض' : 'عادي'}</div>
            </div>
            <button class="small-btn" onclick="deleteProduct(${product.id})" 
                    style="background:var(--danger);padding:4px 8px;">حذف</button>
        </div>
    `).join('') || '<div style="text-align:center;color:#666;padding:10px;">لا توجد منتجات</div>';
}

// عارض الصور
let currentImageSet = [];
let currentImageIndex = 0;

function openImageViewer(productId, imageIndex = 0) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length === 0) return;

    currentImageSet = product.images;
    currentImageIndex = imageIndex;
    showImageInViewer();
    const imgViewer = document.getElementById('imgViewer');
    if (imgViewer) imgViewer.style.display = 'flex';
}

function showImageInViewer() {
    const viewerImg = document.getElementById('viewerImg');
    const prevBtn = document.getElementById('viewerPrev');
    const nextBtn = document.getElementById('viewerNext');

    if (currentImageSet.length === 0 || !viewerImg) return;

    viewerImg.src = currentImageSet[currentImageIndex];
    
    // إخفاء/إظهار أزرار التنقل
    if (prevBtn) prevBtn.style.display = currentImageSet.length > 1 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = currentImageSet.length > 1 ? 'block' : 'none';
}

function closeImageViewer() {
    const imgViewer = document.getElementById('imgViewer');
    if (imgViewer) imgViewer.style.display = 'none';
}

function prevImage() {
    if (currentImageSet.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImageSet.length) % currentImageSet.length;
    showImageInViewer();
}

function nextImage() {
    if (currentImageSet.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImageSet.length;
    showImageInViewer();
}

// إدارة التنقل والسلة
function switchSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
    
    const navId = sectionId === 'control' ? 'nav-admin' : `nav-${sectionId}`;
    const targetNav = document.getElementById(navId);
    if (targetNav) targetNav.classList.add('active');

    if (sectionId === 'control') {
        openAdmin();
    }
}

function openCart() {
    if (cartSide) {
        cartSide.classList.add('open');
        cartSide.setAttribute('aria-hidden', 'false');
    }
}

function closeCart() {
    if (cartSide) {
        cartSide.classList.remove('open');
        cartSide.setAttribute('aria-hidden', 'true');
    }
}

function showCartIndicator() {
    const buyBtn = document.getElementById('buyBtn');
    const indicator = document.getElementById('buyBtnIndicator');
    
    if (buyBtn) {
        buyBtn.classList.add('blink');
        setTimeout(() => buyBtn.classList.remove('blink'), 2000);
    }
    
    if (indicator) {
        indicator.style.display = 'block';
        setTimeout(() => indicator.style.display = 'none', 2000);
    }
}

// مستمعي الأحداث
document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة قاعدة البيانات
    await initializeDatabase();
    
    // تحميل المنتجات عند بدء التطبيق
    await loadProducts();
    updateCartUI();

    // التنقل
    const navHome = document.getElementById('nav-home');
    const navOffers = document.getElementById('nav-offers');
    const navAdmin = document.getElementById('nav-admin');
    
    if (navHome) {
        navHome.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('home');
        });
    }

    if (navOffers) {
        navOffers.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('offers');
        });
    }

    if (navAdmin) {
        navAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('control');
        });
    }

    // السلة
    const orderSticker = document.getElementById('orderSticker');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const buyBtn = document.getElementById('buyBtn');
    
    if (orderSticker) orderSticker.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (buyBtn) buyBtn.addEventListener('click', sendOrder);

    // عارض الصور
    const viewerClose = document.getElementById('viewerClose');
    const viewerPrev = document.getElementById('viewerPrev');
    const viewerNext = document.getElementById('viewerNext');
    const imgViewer = document.getElementById('imgViewer');
    
    if (viewerClose) viewerClose.addEventListener('click', closeImageViewer);
    if (viewerPrev) viewerPrev.addEventListener('click', prevImage);
    if (viewerNext) viewerNext.addEventListener('click', nextImage);
    
    // إغلاق عارض الصور بالنقر على الخلفية
    if (imgViewer) {
        imgViewer.addEventListener('click', (e) => {
            if (e.target === imgViewer) {
                closeImageViewer();
            }
        });
    }

    // إغلاق النوافذ بمفتاح Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageViewer();
            closeCart();
            closeAdmin();
        }
    });

    // منع أخطاء JavaScript من التأثير على التطبيق
    window.addEventListener('error', (e) => {
        console.warn('JavaScript error caught:', e.error);
        e.preventDefault();
    });
});

// إضافة الوظائف للنطاق العام لاستخدامها من HTML
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.addToCart = addToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.sendOrder = sendOrder;
window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.adminLogin = adminLogin;
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;
window.prevImage = prevImage;
window.nextImage = nextImage;
window.openCart = openCart;
window.closeCart = closeCart;