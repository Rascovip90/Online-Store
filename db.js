const SUPABASE_URL = "https://rqiognpfzyyfyferyjah.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchProductsFromDB() {
    let { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('id', { ascending: false });
    if (error) return console.error(error);

    products = data.map(p => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        images: p.images || [],
        desc: p.description || '',
        type: p.type || 'normal',
        dateAdded: p.date_added
    }));

    renderProducts();
    renderOffers();
}

async function addProductToDB(product) {
    let { error } = await supabaseClient
        .from('products')
        .insert([{
            name: product.name,
            price: product.price,
            images: product.images,
            description: product.desc,
            type: product.type,
            date_added: product.dateAdded
        }]);
    if (error) console.error(error);
    else fetchProductsFromDB();
}

async function deleteProductFromDB(id) {
    let { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);
    if (error) console.error(error);
    else fetchProductsFromDB();
}

fetchProductsFromDB();