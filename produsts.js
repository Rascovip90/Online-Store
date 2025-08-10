// Helpers لمرونة أسماء الحقول
function firstField(obj, keys){
  for(const k of keys){
    if(!obj) break;
    if(Object.prototype.hasOwnProperty.call(obj,k)) return obj[k];
    if(Object.prototype.hasOwnProperty.call(obj,k.toLowerCase())) return obj[k.toLowerCase()];
    if(Object.prototype.hasOwnProperty.call(obj,k.toUpperCase())) return obj[k.toUpperCase()];
  }
  return undefined;
}
function toImagesArray(field){
  if(!field) return [];
  if(Array.isArray(field)) return field;
  if(typeof field === 'string') return field.split(',').map(s=>s.trim()).filter(Boolean);
  return [];
}

// جلب المنتجات من Supabase (جدول products)
async function fetchProductsFromSupabase(){
  try{
    const { data, error } = await window.supabaseClient
      .from('products')
      .select('*')
      .order('data added', { ascending: false }); // نطلب ترتيب حسب الحقل الموجود عندك
    if(error){ console.error('Supabase fetch error:', error); return []; }
    // normalize
    const mapped = (data||[]).map(p=>{
      return {
        raw: p,
        id: firstField(p,['ID','id']),
        name: firstField(p,['Name','name']),
        price: Number(firstField(p,['Price','price'])||0),
        images: toImagesArray(firstField(p,['Images','images'])),
        desc: firstField(p,['description','desc']),
        type: (firstField(p,['Tayp','tayp','type']) || '').toString().toLowerCase(),
        added: firstField(p,['data added','date_added','dateAdded'])
      };
    });
    window.__STORE_PRODUCTS = mapped;
    return mapped;
  }catch(err){
    console.error('fetchProductsFromSupabase error', err);
    return [];
  }
}

// رندر (بناء DOM) — تستخدم من main.js بعد جلب المنتجات
function createProductCard(prod){
  const card = document.createElement('div'); card.className='card';
  const main = (prod.images && prod.images.length) ? prod.images[0] : '';
  const thumbsHTML = (prod.images||[]).slice(0,4).map((u,i)=>`<img src="${escapeHtml(u)}" class="thumb ${i===0?'active':''}" data-index="${i}" data-src="${escapeHtml(u)}">`).join('');
  const isNew = prod.added ? (Date.now() - new Date(prod.added).getTime() < 24*60*60*1000) : false;
  card.innerHTML = `
    <div class="gallery">
      ${isNew?'<div class="badge-new">NEW</div>':''}
      <img src="${escapeHtml(main)}" class="main-img" data-id="${escapeHtml(prod.id)}" data-index="0" alt="${escapeHtml(prod.name)}">
      <div class="thumbs">${thumbsHTML}</div>
    </div>
    <h4>${escapeHtml(prod.name)}</h4>
    <p class="desc">${escapeHtml(prod.desc||'')}</p>
    <p class="price">${formatCurrency(prod.price)} ريال عماني</p>
    <button class="add-btn">أضف للسلة</button>
  `;
  // attach events after return in main.js
  return card;
}