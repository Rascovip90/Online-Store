// cart.js
let cart = JSON.parse(localStorage.getItem('my_cart_v3')||'[]');

function saveCartToLocal(){ localStorage.setItem('my_cart_v3', JSON.stringify(cart)); }
function addToCartById(id){
  const prod = (window.__STORE_PRODUCTS||[]).find(p=>p.id == id);
  if(!prod) return;
  const ex = cart.find(c=>c.id==id);
  if(ex) ex.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  saveCartToLocal(); renderCartViews(); updateSticker();
}
function updateQty(id, delta){
  const it = cart.find(c=>c.id==id); if(!it) return;
  it.qty += delta; if(it.qty<=0) cart = cart.filter(c=>c.id!=id);
  saveCartToLocal(); renderCartViews(); updateSticker();
}
function removeFromCart(id){ cart = cart.filter(c=>c.id!=id); saveCartToLocal(); renderCartViews(); updateSticker(); }

function renderCartViews(){
  const sideItems = document.getElementById('sideItems'); sideItems.innerHTML='';
  let total = 0;
  cart.forEach(ci=>{
    const p = (window.__STORE_PRODUCTS||[]).find(x=>x.id==ci.id) || {};
    total += (Number(ci.price)||0) * ci.qty;
    const item = document.createElement('div'); item.className='item';
    item.innerHTML = `
      <img src="${escapeHtml((p.images||[])[0]||'')}" alt="${escapeHtml(ci.name)}">
      <div class="meta">
        <div class="name">${escapeHtml(ci.name)}</div>
        <div class="sub">${formatCurrency(ci.price)} ريال عماني × ${ci.qty}</div>
      </div>
      <div class="qty">
        <button onclick="updateQty(${ci.id},-1)">-</button>
        <span style="min-width:18px;text-align:center">${ci.qty}</span>
        <button onclick="updateQty(${ci.id},+1)">+</button>
      </div>
      <div style="margin-left:6px"><button class="remove-btn" onclick="removeFromCart(${ci.id})">حذف</button></div>
    `;
    sideItems.appendChild(item);
  });
  document.getElementById('sideTotalHead').textContent = formatCurrency(total) + ' ريال عماني';
  updateSticker();
}

function updateSticker(){
  const c = cart.reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('stickerCount');
  el.textContent = c; el.style.display = c? 'block':'none';
}

// Checkout -> يحفظ أوامر في جدول orders
async function checkoutOrders(){
  if(cart.length===0){ alert('السلة فارغة'); return; }
  if(!confirm('هل تريد إرسال الطلب وحفظه في قاعدة البيانات؟')) return;
  try{
    const payload = cart.map(ci=>({ user_id: localStorage.getItem('store_user_id_v1') || 'anon', product_id: ci.id, quantity: ci.qty }));
    const { error } = await window.supabaseClient.from('orders').insert(payload);
    if(error) throw error;
    alert('تم حفظ الطلب ✅');
    cart = []; saveCartToLocal(); renderCartViews();
    document.getElementById('cartSide').classList.remove('open');
  }catch(err){ console.error('checkout err', err); alert('فشل حفظ الطلب — شوف الكونسول'); }
}