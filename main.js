const PRODUCTS_KEY = 'my_products_v3';
const CART_KEY = 'my_cart_v3';
const ADMIN_PASS = '7732';
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const productsGrid = document.getElementById('productsGrid');
const offersGrid = document.getElementById('offersGrid');
const cartSide = document.getElementById('cartSide');
const sideItems = document.getElementById('sideItems');
const adminModal = document.getElementById('adminModal');
const loginPanel = document.getElementById('loginPanel');
const controlPanel = document.getElementById('controlPanel');
const adminListDiv = document.getElementById('adminList');
const imgViewer = document.getElementById('imgViewer');
const viewerImg = document.getElementById('viewerImg');
const viewerPrev = document.getElementById('viewerPrev');
const viewerNext = document.getElementById('viewerNext');
const viewerClose = document.getElementById('viewerClose');
const orderSticker = document.getElementById('orderSticker');
const stickerCountEl = document.getElementById('stickerCount');
const buyBtn = document.getElementById('buyBtn');
const buyBtnIndicator = document.getElementById('buyBtnIndicator');

function saveProducts(){localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));}
function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));}
function formatCurrency(v){return Number(v).toFixed(2);}
function escapeHtml(s){if(!s && s!==0)return '';return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function renderProducts(){
  productsGrid.innerHTML='';
  const now=Date.now();
  products.filter(p=>p.type==='normal').forEach(p=>{
    const card=document.createElement('div');
    card.className='card';
    const imgs=Array.isArray(p.images)?p.images.slice(0,4):[];
    const main=imgs[0]||'';
    card.innerHTML=`
      <div class="gallery">
        ${(now-p.dateAdded<24*60*60*1000)?'<div class="badge-new">NEW</div>':''}
        <img src="${escapeHtml(main)}" class="main-img" alt="${escapeHtml(p.name)}" data-id="${p.id}" data-index="0">
        <div class="thumbs">
          ${imgs.map((u,i)=>`<img src="${escapeHtml(u)}" class="thumb ${i===0?'active':''}" data-id="${p.id}" data-index="${i}" alt="thumb">`).join('')}
        </div>
      </div>
      <h4>${escapeHtml(p.name)}</h4>
      <p class="desc">${escapeHtml(p.desc||'')}</p>
      <p class="price">${formatCurrency(p.price)} ريال عماني</p>
      <button class="add-btn" onclick="addToCartById(${p.id})">أضف للسلة</button>
    `;
    productsGrid.appendChild(card);
  });
  attachGalleryHandlers();
}

function renderOffers(){
  offersGrid.innerHTML='';
  const now=Date.now();
  products.filter(p=>p.type==='offer').forEach(p=>{
    const card=document.createElement('div');
    card.className='card';
    const imgs=Array.isArray(p.images)?p.images.slice(0,4):[];
    const main=imgs[0]||'';
    card.innerHTML=`
      <div class="gallery">
        ${(now-p.dateAdded<24*60*60*1000)?'<div class="badge-new">NEW</div>':''}
        <img src="${escapeHtml(main)}" class="main-img" alt="${escapeHtml(p.name)}" data-id="${p.id}" data-index="0">
        <div class="thumbs">
          ${imgs.map((u,i)=>`<img src="${escapeHtml(u)}" class="thumb ${i===0?'active':''}" data-id="${p.id}" data-index="${i}" alt="thumb">`).join('')}
        </div>
      </div>
      <h4>${escapeHtml(p.name)}</h4>
      <p class="desc">${escapeHtml(p.desc||'')}</p>
      <p class="price">${formatCurrency(p.price)} ريال عماني</p>
      <button class="add-btn" onclick="addToCartById(${p.id})">أضف للسلة</button>
    `;
    offersGrid.appendChild(card);
  });
  attachGalleryHandlers();
}

function changeViewerImg(newSrc) {
  viewerImg.classList.add('fade');
  setTimeout(function(){
    viewerImg.src = newSrc;
    viewerImg.onload = function() {
      viewerImg.classList.remove('fade');
    };
  }, 180);
}

function attachGalleryHandlers(){
  document.querySelectorAll('.thumb').forEach(t=>{
    t.addEventListener('click',function(){
      const card=this.closest('.card');
      const main=card.querySelector('.main-img');
      card.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active'));
      this.classList.add('active');
      main.classList.add('fade');
      setTimeout(function(){
        main.src = t.src;
        main.classList.remove('fade');
      },180);
      main.dataset.index=this.dataset.index;
    });
  });
  document.querySelectorAll('.main-img').forEach(m=>{
    m.addEventListener('click',function(){
      const id=Number(this.dataset.id);
      const prod=products.find(p=>p.id===id);
      if(!prod)return;
      const imgs=Array.isArray(prod.images)&&prod.images.length?prod.images:[''];
      let start=Number(this.dataset.index||0);
      openViewer(imgs,start);
    });
  });
}

let viewerImgs=[];let viewerIndex=0;
function openViewer(imgs,startIndex=0){
  viewerImgs=imgs;
  viewerIndex=startIndex||0;
  changeViewerImg(viewerImgs[viewerIndex]||'');
  imgViewer.style.display='flex';
  imgViewer.setAttribute('aria-hidden','false');
}
function closeViewer(){
  imgViewer.style.display='none';
  imgViewer.setAttribute('aria-hidden','true');
}
viewerPrev.addEventListener('click',()=>{
  if(viewerImgs.length===0)return;
  viewerIndex=(viewerIndex-1+viewerImgs.length)%viewerImgs.length;
  changeViewerImg(viewerImgs[viewerIndex]);
});
viewerNext.addEventListener('click',()=>{
  if(viewerImgs.length===0)return;
  viewerIndex=(viewerIndex+1)%viewerImgs.length;
  changeViewerImg(viewerImgs[viewerIndex]);
});
viewerClose.addEventListener('click',closeViewer);
imgViewer.addEventListener('click',e=>{if(e.target===imgViewer)closeViewer();});

function addToCartById(id){
  const product=products.find(p=>p.id===id);
  if(!product)return;
  const existing=cart.find(c=>c.id===id);
  if(existing)existing.qty+=1;
  else cart.push({id:product.id,qty:1});
  saveCart();
  renderCartViews();
  updateSticker(true);
}

function updateQty(id,delta){
  const item=cart.find(c=>c.id===id);
  if(!item)return;
  item.qty+=delta;
  if(item.qty<=0)cart=cart.filter(c=>c.id!==id);
  saveCart();
  renderCartViews();
}
function removeFromCart(id){cart=cart.filter(c=>c.id!==id);saveCart();renderCartViews();}

function renderCartViews(){
  // Ensure sideContent and sideItems exist; if cart-side is simplified in index, adapt.
  const sideItemsEl = document.getElementById('sideItems') || sideItems;
  if(sideItemsEl) sideItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(ci=>{
    const p = products.find(x=>x.id===ci.id);
    if(!p) return;
    total += p.price * ci.qty;
    const item = document.createElement('div'); item.className='item';
    const imgSrc = (Array.isArray(p.images) && p.images.length) ? p.images[0] : '';
    item.innerHTML = `
      <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}">
      <div class="meta">
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="sub">${formatCurrency(p.price)} ريال عماني × ${ci.qty}</div>
      </div>
      <div class="qty">
        <button onclick="updateQty(${p.id},-1)">-</button>
        <span style="min-width:18px;text-align:center">${ci.qty}</span>
        <button onclick="updateQty(${p.id},+1)">+</button>
      </div>
      <div style="margin-left:6px"><button class="remove-btn" onclick="removeFromCart(${p.id})">حذف</button></div>
    `;
    if(sideItemsEl) sideItemsEl.appendChild(item);
  });
  const sideTotalHead = document.getElementById('sideTotalHead');
  if(sideTotalHead) sideTotalHead.textContent = formatCurrency(total) + ' ريال عماني';
  const count = cart.reduce((s,i)=>s+i.qty,0);
  if(stickerCountEl){
    stickerCountEl.textContent = count;
    stickerCountEl.style.display = count ? 'block' : 'none';
  }
}

function updateSticker(on){
  const c = cart.reduce((s,i)=>s+i.qty,0);
  if(stickerCountEl){
    stickerCountEl.textContent = c;
    stickerCountEl.style.display = c ? 'block' : 'none';
  }
}

function openSideCart(){
  cartSide.classList.add('open');
  cartSide.setAttribute('aria-hidden','false');
  updateSticker(false);

  // وميض زر واتساب لمدة 5 ثواني ثم تظهر النقطة الحمراء
  if(buyBtn) buyBtn.classList.add('blink');
  if(buyBtnIndicator) buyBtnIndicator.style.display = "none";
  setTimeout(function(){
    if(buyBtn) buyBtn.classList.remove('blink');
    if(buyBtnIndicator) buyBtnIndicator.style.display = "block";
  }, 5000);
}
function closeSideCart(){
  cartSide.classList.remove('open');
  cartSide.setAttribute('aria-hidden','true');
  if(buyBtnIndicator) buyBtnIndicator.style.display = "none";
  if(buyBtn) buyBtn.classList.remove('blink');
}

const closeCartBtn = document.getElementById('closeCartBtn');
if(closeCartBtn) closeCartBtn.addEventListener('click',()=>closeSideCart());
if(orderSticker) orderSticker.addEventListener('click',()=>openSideCart());
const navAdmin = document.getElementById('nav-admin');
if(navAdmin) navAdmin.addEventListener('click',function(e){
  e.preventDefault();
  document.getElementById('adminModal').style.display = 'flex';
});

function openAdminModal(){
  adminModal.style.display='flex';
  loginPanel.style.display=sessionStorage.getItem('adminAuth')==='true'?'none':'flex';
  controlPanel.style.display=sessionStorage.getItem('adminAuth')==='true'?'block':'none';
  const adminPassInput = document.getElementById('adminPass');
  if(adminPassInput) adminPassInput.value='';
}
function closeAdmin(){adminModal.style.display='none';}
function adminLogin(){const pass=document.getElementById('adminPass').value;if(pass===ADMIN_PASS){sessionStorage.setItem('adminAuth','true');loginPanel.style.display='none';controlPanel.style.display='block';loadAdminList();}else{alert('كلمة المرور خاطئة');}}

function loadAdminList(){ 
  if(!adminListDiv) return;
  adminListDiv.innerHTML='';
  products.forEach(p=>{const row=document.createElement('div');row.className='admin-item';row.style.display='flex';row.style.justifyContent='space-between';row.style.alignItems='center';row.style.padding='6px 0';row.innerHTML=`<div style="max-width:70%"><strong>${escapeHtml(p.name)}</strong><br><small style="color:#333">${escapeHtml(p.desc||'')}</small></div><div style="display:flex;gap:6px"><button class="small-btn" onclick="editProduct(${p.id})">تعديل</button><button style="background:var(--danger);color:#fff;padding:6px 7px;border-radius:8px;border:0;cursor:pointer;font-size:11px;" onclick="deleteProduct(${p.id})">حذف</button></div>`;adminListDiv.appendChild(row);});
}

function addProduct(){const name=document.getElementById('prodName').value.trim();const price=parseFloat(document.getElementById('prodPrice').value);const imagesRaw=document.getElementById('prodImages').value.trim();const desc=document.getElementById('prodDesc').value.trim();const type=document.getElementById('prodType').value;if(!name||!imagesRaw||isNaN(price)){alert('الرجاء تعبئة الاسم، الصور (روابط) والسعر بشكل صحيح');return;}const imgs=imagesRaw.split(',').map(s=>s.trim()).filter(s=>s).slice(0,4);const newP={id:Date.now(),name,price,images:imgs,desc,type,dateAdded:Date.now()};products.push(newP);saveProducts();renderProducts();renderOffers();loadAdminList();document.getElementById('prodName').value='';document.getElementById('prodPrice').value='';document.getElementById('prodImages').value='';document.getElementById('prodDesc').value='';}

function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;sessionStorage.setItem('adminAuth','true');loginPanel.style.display='none';controlPanel.style.display='block';document.getElementById('prodName').value=p.name;document.getElementById('prodPrice').value=p.price;document.getElementById('prodImages').value=Array.isArray(p.images)?p.images.join(', '):'';document.getElementById('prodDesc').value=p.desc||'';document.getElementById('prodType').value=p.type||'normal';deleteProduct(id);}

function deleteProduct(id){if(!confirm('هل تريد حذف المنتج؟'))return;products=products.filter(p=>p.id!==id);cart=cart.filter(c=>c.id!==id);saveProducts();saveCart();renderProducts();renderOffers();renderCartViews();loadAdminList();}

function showSection(sec){
  document.getElementById('home').style.display='none';
  document.getElementById('offers').style.display='none';
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  if(sec==='home'){
    document.getElementById('home').style.display='block';
    document.getElementById('nav-home').classList.add('active');
    window.location.hash='#home';
  }else if(sec==='offers'){
    document.getElementById('offers').style.display='block';
    document.getElementById('nav-offers').classList.add('active');
    window.location.hash='#offers';
  }
}
document.getElementById('nav-home').addEventListener('click',()=>showSection('home'));
document.getElementById('nav-offers').addEventListener('click',()=>showSection('offers'));
function initSectionFromHash(){
  const h = window.location.hash || '#home';
  if(h === '#offers') showSection('offers');
  else showSection('home');
}
window.addEventListener('hashchange',initSectionFromHash);

(function init(){
  cart=cart.filter(ci=>products.some(p=>p.id===ci.id));
  saveCart();
  renderProducts();
  renderOffers();
  renderCartViews();
  initSectionFromHash();
  updateSticker(false);
})();

if(buyBtn){
  buyBtn.addEventListener('click', function(){
    if(cart.length === 0){ alert('السلة فارغة'); return; }
    let text = "مرحبًا، أود تقديم طلب شراء:\n";
    text += "---------------------\n";
    text += "المنتجات المطلوبة:\n";
    let total = 0;
    cart.forEach((ci, idx) => {
      const p = products.find(x => x.id === ci.id);
      if(!p) return;
      text += `${idx + 1}. ${p.name} × ${ci.qty} = ${formatCurrency(p.price * ci.qty)} ريال عماني\n`;
      total += p.price * ci.qty;
    });
    text += "---------------------\n";
    text += `المجموع الكلي: ${formatCurrency(total)} ريال عماني\n\n`;
    text += "يرجى تأكيد الطلب أو التواصل لأي استفسار. شكرًا لكم!";
    window.open(`https://wa.me/77324648?text=${encodeURIComponent(text)}`, '_blank');
  });
}

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if(imgViewer && imgViewer.style.display==='flex')closeViewer();
    if(adminModal && adminModal.style.display==='flex')closeAdmin();
  }
});