// ================================
// VARIABLES GLOBALES
// ================================

let cart = [];
let currentProductSlides = {};

// ================================
// INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadCartFromStorage();
    loadProducts();
    setupEventListeners();
    initSmoothScroll();
    initHeaderScroll();
});

// ================================
// CONFIGURACIÓN INICIAL
// ================================

function initializeApp() {
    console.log('Ionik E-commerce iniciado');
    updateCartCount();
}

// ================================
// EVENT LISTENERS
// ================================

function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            scrollToSection(target);
            closeMenu();
        });
    });

    // Filtros de productos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            
            // 🚨 1. DEFINIR filterValue A PARTIR DEL BOTÓN CLICKADO
            const filterValue = btn.dataset.filter;
            
            // 2. Lógica para manejar la clase 'active'
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 🚨 3. LÓGICA CONDICIONAL DEBE ESTAR AQUÍ DENTRO
            if (filterValue === 'ofertas') {
                filterOffersOnly(); // Llama a la función independiente
            } else {
                // Tu código anterior ya hacía esto, pero ahora solo para los filtros de categoría/todos
                filterProducts(filterValue); 
            }
        });
    });
    
}

// ================================
// FILTRO INDEPENDIENTE DE OFERTAS
// ================================

function filterOffersOnly() {
    const allProducts = document.querySelectorAll('.product-card');
    let offersFound = false;

    // 1. Iterar sobre todos los productos para filtrar y aplicar visibilidad
    allProducts.forEach(productElement => {
        
        // Lee el valor del badge desde el atributo de datos del HTML
        const badgeValue = productElement.dataset.badge;

        // Condición: Si el producto tiene el badge 'OFERTA' (comparación robusta)
        const isOffer = badgeValue && badgeValue.toUpperCase() === 'OFERTA';
        
        if (isOffer) {
            // MOSTRAR el producto de oferta
            productElement.style.display = 'block';
            setTimeout(() => {
                productElement.style.opacity = '1';
                productElement.style.transform = 'translateY(0)';
            }, 10);
            offersFound = true;

        } else {
            // OCULTAR cualquier otro producto (incluyendo 'cargadores', 'lamparas', etc.)
            productElement.style.opacity = '0';
            productElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                productElement.style.display = 'none';
            }, 300);
        }
    });

    // Opcional: Manejar el caso de que no haya ofertas
    if (!offersFound) {
        // Podrías mostrar un mensaje aquí
        console.log("No se encontraron productos en oferta."); 
    }
}

// ================================
// HEADER SCROLL
// ================================

function initHeaderScroll() {
    let lastScroll = 0;
    const header = document.getElementById('mainHeader');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }

        // Header slim en móvil al hacer scroll
        if (window.innerWidth <= 768) {
            if (currentScroll > 50) {
                header.classList.add('header-slim');
            } else {
                header.classList.remove('header-slim');
            }
        }
        
        lastScroll = currentScroll;
    });
}

// ================================
// SMOOTH SCROLL
// ================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const headerHeight = document.getElementById('mainHeader').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function scrollToProducts() {
    scrollToSection('#productos');
}

// ================================
// BARRA PROMOCIONAL
// ================================

function closePromoBar() {
    const promoBar = document.getElementById('promoBar');
    promoBar.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => {
        promoBar.style.display = 'none';
    }, 300);
}

// ================================
// MENÚ MÓVIL
// ================================

function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    const overlay = document.getElementById('overlay');
    
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeMenu() {
    const nav = document.getElementById('mainNav');
    const overlay = document.getElementById('overlay');
    
    nav.classList.remove('active');
    overlay.classList.remove('active');
}

// ================================
// CARRITO
// ================================

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    const isOpening = !cartSidebar.classList.contains('active');

    if (isOpening) {
        backToCart();
    }

    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeAll() {
    const cartSidebar = document.getElementById('cartSidebar');
    const nav = document.getElementById('mainNav');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.remove('active');
    nav.classList.remove('active');
    overlay.classList.remove('active');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function saveCartToStorage() {
    localStorage.setItem('ionikCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('ionikCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
        updateCartCount();
    }
}

// ================================
// FILTROS DE PRODUCTOS
// ================================

function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, 10);
        } else {
            product.style.opacity = '0';
            product.style.transform = 'translateY(20px)';
            setTimeout(() => {
                product.style.display = 'none';
            }, 300);
        }
    });
}

// ================================
// SLIDER DE IMÁGENES
// ================================

function initProductSlider(productId, imageCount) {
    currentProductSlides[productId] = 0;
    
    // Auto-play slider
    setInterval(() => {
        nextSlide(productId, imageCount);
    }, 3000);
}

function nextSlide(productId, imageCount) {
    currentProductSlides[productId] = (currentProductSlides[productId] + 1) % imageCount;
    updateSlider(productId);
}

function goToSlide(productId, index) {
    currentProductSlides[productId] = index;
    updateSlider(productId);
}

function updateSlider(productId) {
    const slider = document.querySelector(`#product-${productId} .product-image-slider`);
    const dots = document.querySelectorAll(`#product-${productId} .slider-dot`);
    
    if (slider) {
        const translateX = -currentProductSlides[productId] * 100;
        slider.style.transform = `translateX(${translateX}%)`;
    }
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentProductSlides[productId]);
    });
}

// ================================
// NOTIFICACIONES
// ================================

function showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 3000);
}

// ================================
// CHECKOUT
// ================================

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Carrito vacío', 'Agrega productos antes de continuar', 'error');
        return;
    }

    // Feedback visual inmediato para evitar doble click
    const btn = document.querySelector('.btn-checkout');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Cargando...';
    }

    // Tracking: InitiateCheckout centralizado
    const totalCheckout = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    IonkAnalytics.trackEvent('begin_checkout', {
        value:     totalCheckout,
        num_items: cart.length,
        items:     cart.map(function(item) {
            return { item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity };
        })
    });

    showCheckoutInCart();
}

function showCheckoutInCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartSidebar.innerHTML = `
        <div class="cart-header">
            <button class="back-to-cart" onclick="backToCart()">← Volver</button>
            <h2>Finalizar Compra</h2>
            <button class="close-cart" onclick="toggleCart()">×</button>
        </div>
        
        <div class="cart-content">
            <div class="checkout-summary">
                <h3>Resumen del Pedido</h3>
                <div class="summary-total">
                    <span>Total a pagar:</span>
                    <span class="total-amount">${formatPrice(total)}</span>
                </div>
            </div>
            
            <div class="payment-section">
                <h3>Coordinar por WhatsApp</h3>
                <p>Al confirmar, se abrirá WhatsApp con los detalles del pedido para coordinar envío y pago.</p>
            </div>
        </div>
        
        <div class="cart-footer checkout-actions">
            <button class="btn-secondary" onclick="backToCart()">Cancelar</button>
            <button class="btn-primary btn-confirm-checkout" onclick="confirmPayment()">
                Confirmar Pedido
            </button>
        </div>
        <div class="checkout-ml-alt">
            <p>¿Prefieres comparar o pagar con MercadoPago?</p>
            <a href="https://listado.mercadolibre.cl/_CustId_2585303509?item_id=MLC1874104825&category_id=MLC157684&seller_id=2585303509&client=recoview-selleritems&recos_listing=true"
               target="_blank" rel="noopener noreferrer"
               onclick="trackOutboundToMercadoLibre(event, this.href)">
                🛍️ Ver también en MercadoLibre
            </a>
        </div>
    `;
}

function backToCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h2>Tu Carrito</h2>
            <button class="close-cart" onclick="toggleCart()">×</button>
        </div>
        <div class="cart-items" id="cartItems"></div>
        <div class="cart-footer">
            <div id="shippingBar"></div>
            <div class="cart-total">
                <span>Total:</span>
                <span id="cartTotal">$0</span>
            </div>
            <div class="temuco-trust-badge">
                📦 Despacho desde Temuco a todo Chile 🇨🇱
            </div>
            <button class="btn-primary btn-checkout" onclick="proceedToCheckout()">
                Proceder al Pago
            </button>
            <div class="payment-trust-bar">
                <p class="pay-trust-label">Pago seguro con:</p>
                <div class="pay-logos-row">
                    <span class="pay-logo visa">VISA</span>
                    <span class="pay-logo mastercard"><span class="mc-r">●</span><span class="mc-o">●</span></span>
                    <span class="pay-logo webpay">WebPay Plus</span>
                    <span class="pay-logo mercadopago">Mercado Pago</span>
                </div>
            </div>
        </div>
    `;
    updateCartDisplay();
}

function showCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.id = 'checkoutModal';
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    modal.innerHTML = `
        <h2>Finalizar Compra</h2>
        <p>Total a pagar: $${total.toLocaleString('es-CL')}</p>
        
        <div class="payment-methods">
            <p>Al confirmar, se abrirá WhatsApp con los detalles del pedido para coordinar envío y pago.</p>
        </div>
        
        <div class="modal-actions">
            <button class="btn-cancel" onclick="closeCheckoutModal()">Cancelar</button>
            <button class="btn-confirm" onclick="confirmPayment()">Confirmar Pedido</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('overlay').classList.add('active');
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('overlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    
    setTimeout(() => {
        modal.remove();
    }, 300);
}

let selectedPaymentMethod = 'whatsapp';

function selectPaymentMethod(element, method) {
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedPaymentMethod = method;
}

function confirmPayment() {
    if (!selectedPaymentMethod) {
        showNotification('Selecciona un método', 'Debes seleccionar un método de pago', 'error');
        return;
    }
    
    // Preparar datos del pedido para WhatsApp
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNumber = "IONIK-" + Date.now();
    
    const itemsText = cart
        .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-CL')}`)
        .join('\n');
    
    // Usar coordinación por WhatsApp en lugar de transferencia
    // (Datos de transferencia eliminados)
    
    const message = `
¡Hola! 👋 Quiero confirmar mi pedido:

📋 *N° de Pedido:* ${orderNumber}

🛒 *Productos:*
${itemsText}

💰 *Total:* $${total.toLocaleString('es-CL')}

📲 *Contacto:* Coordinemos por WhatsApp para coordinar envío y forma de pago.

Gracias!
    `.trim();
    
    const phone = "56962769503";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Mostrar confirmación en el carrito (WhatsApp)
    showWhatsAppConfirmationInCart();

    // Tracking: Purchase centralizado
    IonkAnalytics.trackEvent('purchase', {
        order_id: orderNumber,
        value:    total,
        items:    cart.map(function(item) {
            return { item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity };
        })
    });

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
}

function showWhatsAppConfirmationInCart() {
    const cartSidebar = document.getElementById('cartSidebar');

    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h2>✅ ¡Pedido enviado por WhatsApp!</h2>
            <button class="close-cart" onclick="closeCheckoutAndClearCart()">×</button>
        </div>

        <div class="cart-content">
            <p>Se ha abierto WhatsApp con los detalles de tu pedido. Coordina el envío y la forma de pago con nosotros por ese chat.</p>
        </div>

        <div class="cart-footer">
            <button class="btn-primary" onclick="closeCheckoutAndClearCart()">Cerrar</button>
        </div>
    `;
}

function showTransferDetails() {
    const modal = document.getElementById('checkoutModal');

    modal.innerHTML = `
        <h2>✅ ¡Pedido enviado por WhatsApp!</h2>
        <p>Se ha abierto WhatsApp con los detalles de tu pedido. Coordina el envío y la forma de pago por ese chat.</p>
        <div class="modal-actions">
            <button class="btn-primary" onclick="closeCheckoutAndClearCart()">Cerrar</button>
        </div>
    `;
}

function copyAllTransferData() {
    const transferText = `Banco: Banco de Chile
Tipo de cuenta: Cuenta Corriente
N° de cuenta: 00-242-18919-09
RUT: 78.193.643-K
Nombre: MAGNUTECH SpA
Correo: ioniktemuco@gmail.com`;

    const textarea = document.createElement('textarea');
    textarea.value = transferText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showNotification('¡Copiado!', 'Datos de transferencia copiados al portapapeles', 'success');
    } catch (err) {
        showNotification('Error', 'No se pudo copiar', 'error');
    }
    
    document.body.removeChild(textarea);
}

function closeCheckoutAndClearCart() {
    // Limpiar carrito
    cart = [];
    saveCartToStorage();
    updateCartCount();
    
    // Cerrar el sidebar del carrito
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    
    // Restaurar la estructura HTML completa del carrito
    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h2>Tu Carrito</h2>
            <button class="close-cart" onclick="toggleCart()">×</button>
        </div>
        <div class="cart-items" id="cartItems">
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
            </div>
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Total:</span>
                <span id="cartTotal">$0</span>
            </div>
            <button class="btn-primary btn-checkout" onclick="proceedToCheckout()">
                Proceder al Pago
            </button>
        </div>
    `;
}



// ================================
// UTILIDADES
// ================================

function formatPrice(price) {
    return `$${price.toLocaleString('es-CL')}`;
}

// ================================
// MODAL PÁGINAS LEGALES
// ================================

function showUnderConstruction(event) {
    event.preventDefault();
    const modal = document.createElement('div');
    modal.className = 'checkout-modal active';
    modal.id = 'underConstructionModal';
    modal.innerHTML = `
        <div style="text-align:center; padding: 10px 0;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🚧</div>
            <h2 style="margin-bottom: 10px;">Página en construcción</h2>
            <p style="color: var(--gris-oscuro); margin-bottom: 24px;">
                Estamos trabajando en este contenido.<br>Pronto estará disponible.
            </p>
            <button class="btn-primary" onclick="document.getElementById('underConstructionModal').remove(); document.getElementById('overlay').classList.remove('active');">
                Entendido
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('overlay').classList.add('active');
}

// Animación de entrada para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos con animación
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .benefit-card, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

/*<div class="payment-method" onclick="selectPaymentMethod(this, 'webpay')">
                <div class="payment-icon">💳</div>
                <div class="payment-info">
                    <h4>Webpay Plus</h4>
                    <p>Tarjetas de débito y crédito</p>
                </div>
            </div>
            <div class="payment-method" onclick="selectPaymentMethod(this, 'mercadopago')">
                <div class="payment-icon">🛒</div>
                <div class="payment-info">
                    <h4>Mercado Pago</h4>
                    <p>Paga con tu cuenta MP</p>
                </div>
            </div> */

// ================================
// DEEP LINKING — ?item= y ?categoria=
// ================================

/**
 * Lee los parámetros de URL al cargar y:
 *  - ?item=prod-001        → scroll + highlight al producto
 *  - ?item=lampara         → búsqueda por nombre parcial
 *  - ?categoria=cargadores → activa el filtro y hace scroll a la sección
 *
 * Se llama desde displayProducts() en products.js,
 * después de que los cards ya están en el DOM.
 *
 * URLs para anuncios:
 *   ionik.cl/?item=prod-001        (producto específico)
 *   ionik.cl/?item=prod-002
 *   ionik.cl/?categoria=cargadores
 *   ionik.cl/?categoria=lamparas
 *   ionik.cl/?categoria=luces-auto
 *   ionik.cl/?categoria=controles
 *   ionik.cl/?categoria=ofertas
 *   ionik.cl/#productos            (sección productos, sin JS extra)
 */
function initDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const itemParam = params.get('item');
    const catParam  = params.get('categoria');

    if (itemParam) {
        _deepLinkToProduct(itemParam);
    } else if (catParam) {
        _deepLinkToCategory(catParam);
    }
}

function _deepLinkToProduct(itemParam) {
    // Intentar por ID exacto: product-prod-001
    let target = document.getElementById(`product-${itemParam}`);

    // Si no hay match por ID, buscar por nombre parcial (ej: "lampara")
    if (!target) {
        const slug = itemParam.toLowerCase().replace(/-/g, ' ');
        target = Array.from(document.querySelectorAll('.product-card'))
            .find(card => {
                const name = card.querySelector('.product-name');
                return name && name.textContent.toLowerCase().includes(slug);
            });
    }

    if (!target) return;

    // Actualizar OG tags con datos del producto para compartir en redes
    const productId = target.id.replace('product-', '');
    if (typeof sampleProducts !== 'undefined') {
        const product = sampleProducts.find(p => p.id === productId);
        if (product) _updateOGForProduct(product);
    }

    // Scroll suave al producto, centrado en pantalla
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight: borde de acento por 2.5 segundos
    target.style.transition = 'outline 0.3s ease, box-shadow 0.3s ease';
    target.style.outline = '3px solid var(--acento-2)';
    target.style.boxShadow = '0 0 0 6px rgba(239, 154, 109, 0.25)';
    setTimeout(() => {
        target.style.outline = '';
        target.style.boxShadow = '';
    }, 2500);
}

/**
 * Actualiza las meta tags Open Graph y Twitter Card del <head>
 * con los datos del producto encontrado via deep link.
 * Mejora los previews en WhatsApp, Telegram y otras plataformas
 * cuando se comparte una URL con ?item=prod-XXX.
 */
function _updateOGForProduct(product) {
    const base = 'https://ionik.cl';
    const url  = `${base}/?item=${product.id}`;
    const title = `${product.name} | Ionik`;
    const price = product.price.toLocaleString('es-CL');
    const desc  = `${product.description} — $${price} CLP. Envío a todo Chile. 🇨🇱`;
    const image = product.images && product.images[0]
        ? `${base}/${product.images[0]}`
        : `${base}/images_mini/og-preview2.webp`;

    const setMeta = (selector, value) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute('content', value);
    };

    setMeta('meta[property="og:url"]',         url);
    setMeta('meta[property="og:title"]',        title);
    setMeta('meta[property="og:description"]',  desc);
    setMeta('meta[property="og:image"]',        image);
    setMeta('meta[property="og:type"]',         'product');
    setMeta('meta[name="twitter:title"]',       title);
    setMeta('meta[name="twitter:description"]', desc);
    setMeta('meta[name="twitter:image"]',       image);

    // Actualizar canonical y título de pestaña
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    document.title = title;
}

function _deepLinkToCategory(catParam) {
    // Normalizar: luces-auto → Luces Auto, etc.
    const categoryMap = {
        'cargadores':  'cargadores',
        'lamparas':    'lamparas',
        'luces-auto':  'Luces Auto',
        'luces auto':  'Luces Auto',
        'controles':   'Controles',
        'ofertas':     'ofertas'
    };

    const normalized = catParam.toLowerCase().trim();
    const filterValue = categoryMap[normalized] || normalized;

    // Buscar el botón de filtro y hacer click
    const filterBtn = document.querySelector(
        `.filter-btn[data-filter="${filterValue}"]`
    );
    if (filterBtn) {
        filterBtn.click();
    }

    // Scroll a la sección de productos
    const seccion = document.getElementById('productos');
    if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}