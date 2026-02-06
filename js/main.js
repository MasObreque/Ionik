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
    
    showCheckoutModal();
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
            
            <div class="payment-method" onclick="selectPaymentMethod(this, 'transferencia')">
                <div class="payment-icon">🏦</div>
                <div class="payment-info">
                    <h4>Transferencia</h4>
                    <p>Transferencia bancaria</p>
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn-cancel" onclick="closeCheckoutModal()">Cancelar</button>
            <button class="btn-confirm" onclick="confirmPayment()">Confirmar Pago</button>
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

let selectedPaymentMethod = null;

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
    
    // Aquí iría la integración real con la pasarela de pago
    showNotification('¡Orden procesada!', 'Tu pedido ha sido confirmado', 'success');
    
    // Limpiar carrito
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
    updateCartCount();
    
    closeCheckoutModal();
    toggleCart();
}

// ================================
// UTILIDADES
// ================================

function formatPrice(price) {
    return `$${price.toLocaleString('es-CL')}`;
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