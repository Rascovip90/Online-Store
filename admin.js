// admin.js
const ADMIN_PASS = '7732';

async function addProductFromAdmin(){
  if(sessionStorage.getItem('adminAuth')!=='true'){ alert('غير مصرح'); return; }
  const name = document.getElementById('prodName').value.trim();
  const price = parseFloat(document.getElementById('prodPrice').value);
  const imagesRaw = document.getElementById('prodImages').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const type = document.getElementById('prodType').value;
  if(!name || !imagesRaw || isNaN(price)){ alert('الرجاء تعبئة الاسم، الصور (روابط) والسعر بشكل صحيح'); return; }
  const imgs = imagesRaw.split(',').map(s=>s.trim()).filter(Boolean).slice(0,6);
  try{
    const insertObj = { Name: name, Price: price, Images: imgs, description: desc, Tayp: type, ['data added']: new Date().toISOString() };
    const { error } = await window.supabaseClient.from('products').insert([insertObj]);
    if(error) throw error;
    // refresh
    await fetchProductsFromSupabase();
    renderAllProductsOnPage();
    loadAdminList();
    alert('تم إضافة المنتج.');
    // clear inputs
    document.getElementById('prodName').value=''; document.getElementById('prodPrice').value=''; document.getElementById('prodImages').value=''; document.getElementById('prodDesc').value='';
  }catch(err){ console.error('add product err', err); alert('فشل إضافة المنتج — بسرعة اطلع على الكونسول'); }
}

async function deleteProductById(id){
  if(!confirm('هل تريد حذف المنتج نهائيًا؟')) return;
  try{
    const { error } = await window.supabaseClient.from('products').delete().eq('ID', id);
    if(error){
      // try lowercase id column
      const { error: e2 } = await window.supabaseClient.from('products').delete().eq('id', id);
      if(e2) throw e2;
    }
    await fetchProductsFromSupabase();
    renderAllProductsOnPage();
    loadAdminList();
    alert('تم الحذف.');
  }catch(err){ console.error('del err', err); alert('فشل الحذف — راجع الكونسول'); }
}

async function loadAdminList(){
  const list = document.getElementById('adminList'); list.innerHTML='';
  const arr = window.__STORE_PRODUCTS || await fetchProductsFromSupabase();
  arr.forEach(p=>{
    const row = document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='6px 0';
    const left = document.createElement('div'); left.innerHTML = `<strong>${escapeHtml(p.name)}</strong><br><small style="color:#333">${escapeHtml(p.desc||'')}</small>`;
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='6px';
    const del = document.createElement('button'); del.className='small-btn'; del.style.background='var(--danger)'; del.textContent='حذف'; del.onclick = ()=> deleteProductById(p.id);
    actions.appendChild(del); row.appendChild(left); row.appendChild(actions); list.appendChild(row);
  });
}