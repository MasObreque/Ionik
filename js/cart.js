// ================================
// FUNCIONES DEL CARRITO
// ================================

function addToCart(productId, productName, price, image) {
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity++;
        showNotification('Cantidad actualizada', `${productName} agregado al carrito`, 'success');
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
        showNotification('¡Agregado!', `${productName} agregado al carrito`, 'success');
    }
    
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();

    // Tracking: evento AddToCart para Meta Pixel, TikTok y GA4
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_name: productName,
            content_ids: [productId],
            content_type: 'product',
            value: price,
            currency: 'CLP'
        });
    }
    if (typeof ttq !== 'undefined') {
        ttq.track('AddToCart', {
            content_id: productId,
            content_name: productName,
            quantity: 1,
            price: price,
            currency: 'CLP'
        });
    }
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'CLP',
            value: price,
            items: [{ item_id: productId, item_name: productName, price: price, quantity: 1 }]
        });
    }

    // Animación del botón de carrito
    animateCartButton();
}

function removeFromCart(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        const productName = cart[productIndex].name;
        cart.splice(productIndex, 1);
        
        showNotification('Producto eliminado', `${productName} eliminado del carrito`, 'success');
        updateCartDisplay();
        updateCartCount();
        saveCartToStorage();
    }
}

function updateQuantity(productId, change) {
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        product.quantity += change;
        
        if (product.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
            updateCartCount();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = '$0';
        return;
    }
    
    let totalAmount = 0;
    let cartHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotal.textContent = formatPrice(totalAmount);
}

function animateCartButton() {
    const cartButton = document.querySelector('.cart-button');
    cartButton.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        cartButton.style.transform = 'scale(1)';
    }, 200);
}

function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCartDisplay();
        updateCartCount();
        saveCartToStorage();
        showNotification('Carrito vacío', 'Se han eliminado todos los productos', 'success');
    }
}

// ================================
// FUNCIONES DE DESCUENTO
// ================================

function applyDiscount(code) {
    const discountCodes = {
        'IONIK10': 0.10,
        'IONIK20': 0.20,
        'WELCOME': 0.15,
        'PROMO30': 0.30
    };
    
    const discount = discountCodes[code.toUpperCase()];
    
    if (discount) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = total * discount;
        const finalTotal = total - discountAmount;
        
        showNotification(
            '¡Descuento aplicado!',
            `Has ahorrado ${formatPrice(discountAmount)}`,
            'success'
        );
        
        return {
            original: total,
            discount: discountAmount,
            final: finalTotal
        };
    } else {
        showNotification('Código inválido', 'El código de descuento no es válido', 'error');
        return null;
    }
}

// ================================
// CÁLCULO DE ENVÍO
// ================================

function calculateShipping(total) {
    if (total >= 50000) {
        return 0; // Envío gratis
    } else if (total >= 30000) {
        return 3000;
    } else {
        return 5000;
    }
}

function getShippingEstimate(region) {
    const shippingTimes = {
        'santiago': '24-48 horas',
        'valparaiso': '2-3 días',
        'concepcion': '3-4 días',
        'norte': '4-5 días',
        'sur': '4-6 días'
    };
    
    return shippingTimes[region.toLowerCase()] || '3-5 días';
}

// ================================
// GUARDAR CARRITO PARA DESPUÉS
// ================================

function saveCartForLater(productId) {
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        let savedItems = JSON.parse(localStorage.getItem('ionikSavedItems') || '[]');
        
        // Verificar si ya está guardado
        const alreadySaved = savedItems.find(item => item.id === productId);
        
        if (!alreadySaved) {
            savedItems.push(product);
            localStorage.setItem('ionikSavedItems', JSON.stringify(savedItems));
            removeFromCart(productId);
            showNotification('Guardado', 'Producto guardado para después', 'success');
        } else {
            showNotification('Ya guardado', 'Este producto ya está en tu lista', 'error');
        }
    }
}

function loadSavedItems() {
    return JSON.parse(localStorage.getItem('ionikSavedItems') || '[]');
}

function moveToCart(productId) {
    let savedItems = loadSavedItems();
    const itemIndex = savedItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        const item = savedItems[itemIndex];
        addToCart(item.id, item.name, item.price, item.image);
        
        savedItems.splice(itemIndex, 1);
        localStorage.setItem('ionikSavedItems', JSON.stringify(savedItems));
    }
}

// ================================
// EXPORTAR CARRITO
// ================================

function exportCartToCSV() {
    if (cart.length === 0) {
        showNotification('Carrito vacío', 'No hay productos para exportar', 'error');
        return;
    }
    
    let csv = 'Producto,Cantidad,Precio Unitario,Subtotal\n';
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        csv += `"${item.name}",${item.quantity},${item.price},${subtotal}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    csv += `\nTotal,,${total}`;
    
    // Crear y descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ionik-carrito-${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Exportado', 'Carrito exportado exitosamente', 'success');
}

// ================================
// COMPARTIR CARRITO
// ================================

function shareCart() {
    if (cart.length === 0) {
        showNotification('Carrito vacío', 'No hay productos para compartir', 'error');
        return;
    }
    
    const cartData = btoa(JSON.stringify(cart));
    const shareUrl = `${window.location.origin}${window.location.pathname}?cart=${cartData}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mi carrito en Ionik',
            text: 'Mira los productos que seleccioné',
            url: shareUrl
        }).catch(() => {
            copyToClipboard(shareUrl);
        });
    } else {
        copyToClipboard(shareUrl);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Copiado', 'Enlace copiado al portapapeles', 'success');
}

// ================================
// CARGAR CARRITO COMPARTIDO
// ================================

function loadSharedCart() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartParam = urlParams.get('cart');
    
    if (cartParam) {
        try {
            const sharedCart = JSON.parse(atob(cartParam));
            
            if (confirm('¿Quieres cargar este carrito compartido?')) {
                cart = sharedCart;
                updateCartDisplay();
                updateCartCount();
                saveCartToStorage();
                showNotification('Carrito cargado', 'Se ha cargado el carrito compartido', 'success');
                
                // Limpiar URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Error al cargar carrito compartido:', error);
        }
    }
}

// Cargar carrito compartido al iniciar
document.addEventListener('DOMContentLoaded', loadSharedCart);