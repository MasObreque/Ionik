// ================================
// DATOS DE PRODUCTOS (Ejemplo - Reemplazar con API)
// ================================

const sampleProducts = [
    {
        id: 'prod-001',
        name: 'Lampara Multifuncional',
        description: 'Lampara multifuncion, carga Inalambrica, luz de noche, musica',
        price: 89990,
        originalPrice: 129990,
        category: 'lamparas',
        images: [
            'images/lampara1.png',
            'images/lampara2.png',
            'images/lampara3.png'
        ],
        rating: 5,
        reviews: 127,
        stock: 15,
        featured: true,
        badge: 'OFERTA'
    },
    {
        id: 'prod-002',
        name: 'Cargador inalámbrico de 15W  para Auto',
        description: 'Solución compacta y ligera Cargador inalámbrico de 15W  para Auto con sensor inteligente y sujeción automática',
        price: 54990,
        category: 'cargadores',
        images: [
            'images/Cargadorauto1.png',
            'images/Cargadorauto2.png',
            'images/Cargadorauto3.png'
        ],
        rating: 4.5,
        reviews: 89,
        stock: 23,
        featured: true,
        badge: 'NUEVO'
    },
    {
        id: 'prod-003',
        name: 'Cargador inalámbrico 3 en 1 Escritorio',
        description: 'Cargador inalámbrico 3 en 1 para escritorio con luces, plegable',
        price: 189990,
        category: 'cargadores',
        images: [
            'images/3en1Escritorio1.png',
            'images/3en1Escritorio2.png',
            'images/3en1Escritorio3.png'
        ],
        rating: 5,
        reviews: 56,
        stock: 8,
        featured: true
    },
    {
        id: 'prod-004',
        name: 'Cargador de Auto retactil',
        description: 'Cargador de Auto con puerto USB, cable retráctil y carga rápida de 120 W',
        price: 29990,
        category: 'cargadores',
        images: [
            'images/retractil1.png',
            'images/retractil2.png',
            'images/retractil3.png'
        ],
        rating: 4.5,
        reviews: 203,
        stock: 45,
        featured: false
    },
    {
        id: 'prod-005',
        name: 'estación de carga rápida magnética para Auto',
        description: 'Cargador inalámbrico para coche de 15 W, estación de carga rápida magnética, botón táctil para rejilla de ventilación, soporte para teléfono móvil',
        price: 9990,
        originalPrice: 14990,
        category: 'cargadores',
        images: [
            'images/magnéticaAuto1.png',
            'images/magnéticaAuto2.png',
            'images/magnéticaAuto3.png'
        ],
        rating: 4,
        reviews: 312,
        stock: 156,
        featured: false,
        badge: 'OFERTA'
    },
    {
        id: 'prod-006',
        name: 'Estacion Carga para Escritorio',
        description: 'estación de carga inalámbrica multifunción RGB 4 en 1 de 15 W con luz nocturna y cargador inalámbrico PD para teléfonos',
        price: 19990,
        category: 'lamparas',
        images: [
            'images/minimalista1.png',
            'images/minimalista2.png',
            'images/minimalista3.png'
        ],
        rating: 4.5,
        reviews: 78,
        stock: 34,
        featured: false
    }
];

// ================================
// CARGAR PRODUCTOS
// ================================

async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const loading = document.getElementById('productsLoading');
    
    loading.style.display = 'flex';
    
    try {
        // Simular carga desde API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En producción, reemplazar con:
        // const products = await fetchProductsFromOracle();
        const products = sampleProducts;
        
        displayProducts(products);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>Error al cargar productos</h3>
                <p>Por favor, intenta nuevamente más tarde.</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// ================================
// MOSTRAR PRODUCTOS
// ================================

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    const productsHTML = products.map(product => createProductCard(product)).join('');
    productsGrid.innerHTML = productsHTML;
    
    // Inicializar sliders
    products.forEach(product => {
        if (product.images && product.images.length > 1) {
            initProductSlider(product.id, product.images.length);
        }
    });
}

// ================================
// CREAR TARJETA DE PRODUCTO
// ================================

function createProductCard(product) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount 
        ? Math.round((1 - product.price / product.originalPrice) * 100) 
        : 0;
    
    const stockClass = product.stock > 10 ? 'stock-available' 
                     : product.stock > 0 ? 'stock-low' 
                     : 'stock-out';
    
    const stockText = product.stock > 10 ? `${product.stock} disponibles` 
                    : product.stock > 0 ? `Solo ${product.stock} disponibles` 
                    : 'Agotado';
    
    const badgeHTML = product.badge 
        ? `<div class="product-badge ${product.badge === 'NUEVO' ? 'new' : ''}">${product.badge}</div>` 
        : '';
    
    const imagesHTML = product.images.map(img => 
        `<img src="${img}" alt="${product.name}" class="product-image h-full w-full object-contain" 
        onerror="this.src='images/placeholder.jpg'">`
).join('');
    
    const dotsHTML = product.images.length > 1 
        ? `<div class="slider-controls">
            ${product.images.map((_, index) => 
                `<span class="slider-dot ${index === 0 ? 'active' : ''}" 
                      onclick="goToSlide('${product.id}', ${index})"></span>`
            ).join('')}
           </div>`
        : '';
    
    const stars = '★'.repeat(Math.floor(product.rating)) + 
                  (product.rating % 1 >= 0.5 ? '½' : '') + 
                  '☆'.repeat(Math.floor(5 - product.rating));
    
    return `
<div class="product-card" id="product-${product.id}" data-category="${product.category}" data-badge='${product.badge || ''}'>            ${badgeHTML}
            
            <div class="product-image-container">
                <div class="product-image-slider">
                    ${imagesHTML}
                </div>
                ${dotsHTML}
            </div>
            
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-meta">
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.price)}</span>
                        ${hasDiscount ? `
                            <span class="price-original">${formatPrice(product.originalPrice)}</span>
                        ` : ''}
                    </div>
                    <div class="product-rating">
                        <span class="stars-small">${stars}</span>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                </div>
                
                <div class="product-stock ${stockClass}">
                    ${stockText}
                </div>
                
                <button 
                    class="btn-add-to-cart" 
                    onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.images[0]}')"
                    ${product.stock === 0 ? 'disabled' : ''}
                >
                    ${product.stock > 0 ? '🛒 Agregar al Carrito' : 'Agotado'}
                </button>
            </div>
        </div>
    `;
}

// ================================
// UTILIDADES
// ================================

function getCategoryName(category) {
    const categories = {
        'cargadores': 'cargadores',
        'lamparas': 'lamparas',
        'Ofertas': 'OFERTA'
    };
    return categories[category] || category;
}




// ================================
// INTEGRACIÓN CON ORACLE CLOUD
// ================================

async function fetchProductsFromOracle() {
    try {
        const response = await fetch('/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function createProductInOracle(productData) {
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear producto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function updateProductInOracle(productId, updates) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar producto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function deleteProductFromOracle(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ================================
// BÚSQUEDA DE PRODUCTOS
// ================================

function searchProducts(query) {
    const products = document.querySelectorAll('.product-card');
    const searchTerm = query.toLowerCase();
    
    products.forEach(product => {
        const name = product.querySelector('.product-name').textContent.toLowerCase();
        const description = product.querySelector('.product-description').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// ================================
// ORDENAR PRODUCTOS
// ================================

function sortProducts(criteria) {
    const productsGrid = document.getElementById('productsGrid');
    const products = Array.from(productsGrid.children);
    
    products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.price-current').textContent.replace(/[^0-9]/g, ''));
        const priceB = parseFloat(b.querySelector('.price-current').textContent.replace(/[^0-9]/g, ''));
        
        switch(criteria) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'name':
                return a.querySelector('.product-name').textContent.localeCompare(
                    b.querySelector('.product-name').textContent
                );
            default:
                return 0;
        }
    });
    
    products.forEach(product => productsGrid.appendChild(product));
}

// ================================
// VISTA RÁPIDA DEL PRODUCTO
// ================================

function showQuickView(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'checkout-modal quick-view-modal';
    modal.innerHTML = `
        <button class="close-cart" onclick="this.parentElement.remove(); document.getElementById('overlay').classList.remove('active')" 
                style="position: absolute; top: 15px; right: 15px;">×</button>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
                <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: 10px;">
            </div>
            <div>
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <div style="margin: 20px 0;">
                    <span class="price-current" style="font-size: 2rem;">${formatPrice(product.price)}</span>
                </div>
                <button class="btn-primary" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.images[0]}'); this.closest('.quick-view-modal').remove(); document.getElementById('overlay').classList.remove('active');">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('overlay').classList.add('active');
    
    setTimeout(() => modal.classList.add('active'), 10);
}

