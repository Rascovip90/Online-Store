// توصيل الأحداث والتهيئة العامة
function renderAllProductsOnPage(){
  const productsGrid = document.getElementById('productsGrid');
  const offersGrid = document.getElementById('offersGrid');
  productsGrid.innerHTML=''; offersGrid.innerHTML='';
  const arr = window.__STORE_PRODUCTS || [];
  arr.filter(p=>p.type==='normal').forEach(p=>{
    const card = createProductCard(p);
    // attach behaviors here (thumbs, add button)
    attachCardBehavior(card,p);
    productsGrid.appendChild(card);
  });
  arr.filter(p=>p.type==='offer').forEach(p=>{
    const card = createProductCard(p);
    attachCardBehavior(card,p);
    offersGrid.appendChild(card);
  });
}

// attach behaviors to card returned by createProductCard
function attachCardBehavior(card, prod){
  const mainImg = card.querySelector('.main-img');
  const addBtn = card.querySelector('.add-btn');
  const thumbs = card.querySelectorAll('.thumb');
  thumbs.forEach(t=>{
    t.addEventListener('click', function(){
      thumbs.forEach(x=>x.classList.remove('active'));
      this.classList.add('active');
      mainImg.classList.add('fade');
      setTimeout(()=>{ mainImg.src = this.dataset.src; mainImg.classList.remove('fade'); mainImg.dataset.index = this.dataset.index; },160);
    });
  });
  mainImg.addEventListener('click', ()=> openViewer(prod.images, Number(mainImg.dataset.index||0)) );
  addBtn.addEventListener('click', ()=> addToCartById(prod.id));
}

document.addEventListener('DOMContentLoaded', ()=>{
  // nav
  document.getElementById('nav-home').addEventListener('click', e=>{ e.preventDefault(); showSection('home'); });
  document.getElementById('nav-offers').addEventListener('click', e=>{ e.preventDefault(); showSection('offers'); });
  document.getElementById('nav-admin').addEventListener('click', e=>{ e.preventDefault(); document.getElementById('adminModal').style.display='flex'; });

  // cart toggles
  document.getElementById('orderSticker').addEventListener('click', ()=> document.getElementById('cartSide').classList.add('open'));
  document.getElementById('closeCartBtn').addEventListener('click', ()=> document.getElementById('cartSide').classList.remove('open'));

  // admin buttons
  document.getElementById('adminLoginBtn').addEventListener('click', ()=>{
    const pass = document.getElementById('adminPass').value;
    if(pass === ADMIN_PASS){ sessionStorage.setItem('adminAuth','true'); document.getElementById('loginPanel').style.display='none'; document.getElementById('controlPanel').style.display='block'; loadAdminList(); } else alert('كلمة المرور خاطئة');
  });
  document.getElementById('submitProductBtn').addEventListener('click', addProductFromAdmin);
  document.getElementById('adminCloseBtn').addEventListener('click', ()=> document.getElementById('adminModal').style.display='none');

  // viewer controls already inlined in index.html via IDs
  document.getElementById('viewerPrev').addEventListener('click', ()=> { if(window.viewerImgs && window.viewerImgs.length){ window.viewerIndex=(window.viewerIndex-1+window.viewerImgs.length)%window.viewerImgs.length; changeViewerImg(window.viewerImgs[window.viewerIndex]); }});
  document.getElementById('viewerNext').addEventListener('click', ()=> { if(window.viewerImgs && window.viewerImgs.length){ window.viewerIndex=(window.viewerIndex+1)%window.viewerImgs.length; changeViewerImg(window.viewerImgs[window.viewerIndex]); }});
  document.getElementById('viewerClose').addEventListener('click', ()=> { document.getElementById('imgViewer').style.display='none'; });

  // buy button
  document.getElementById('buyBtn').addEventListener('click', ()=> checkoutOrders());

  // init: fetch products and render
  (async ()=>{
    await fetchProductsFromSupabase();
    renderAllProductsOnPage();
    renderCartViews();
    updateSticker();
    const h = window.location.hash || '#home';
    if(h==='#offers') showSection('offers'); else showSection('home');
  })();
});

function showSection(sec){
  document.getElementById('home').style.display = sec==='home' ? 'block':'none';
  document.getElementById('offers').style.display = sec==='offers' ? 'block':'none';
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  if(sec==='home') document.getElementById('nav-home').classList.add('active');
  else if(sec==='offers') document.getElementById('nav-offers').classList.add('active');
}

// small helpers used across files
function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatCurrency(v){ return Number(v||0).toFixed(2); }

// expose some functions globally used in generated HTML/actions
window.addToCartById = addToCartById;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.openViewer = (imgs, idx)=>{ window.viewerImgs = imgs||[]; window.viewerIndex = idx||0; changeViewerImg(window.viewerImgs[window.viewerIndex]||''); document.getElementById('imgViewer').style.display='flex'; };
function changeViewerImg(src){ const vi = document.getElementById('viewerImg'); vi.classList.add('fade'); setTimeout(()=>{ vi.src = src||''; vi.onload = ()=> vi.classList.remove('fade'); },160); }