// ================================
// ANALYTICS CENTRALIZADO — IONIK
// Capa única de tracking compatible con
// GA4, Meta Pixel, TikTok Pixel y GTM futuro
// ================================

// ================================
// CONFIGURACIÓN DE PÍXELES
// Centralización de todos los IDs
// ================================

// Google Analytics 4
const GOOGLE_ANALYTICS_ID = 'G-EWHZNB26KC';        // Principal (index.html)
// const GOOGLE_ANALYTICS_ID_ALT = 'G-1TQV3P3CNY'; // Alternativo (páginas legales)

// Meta Pixel (Facebook)
const META_PIXEL_ID = '2691134951266093';          // Principal (analytics.js)
// const META_PIXEL_ID_ALT = '1243580607965158';   // Alternativo (páginas legales)

// TikTok Pixel
const TIKTOK_PIXEL_ID = 'D8O1VKBC77U23F8ET2K0';     // Principal (activo) D8O1VKBC77U23F8ET2K0 D7011T3C77U1ODGOP02G
// const TIKTOK_PIXEL_ID_ALT = 'D7011T3C77U1ODGOP02G'; //  Alternativo (páginas legales antiguo) 7620108218437500935

const IonkAnalytics = (function () {

    // ---- Estado interno ----
    let _consent = null; // 'all' | 'essential' | null

    // ================================
    // INICIALIZACIÓN
    // ================================

    function init() {
        _consent = localStorage.getItem('ionik_cookie_consent');

        if (_consent === 'all') {
            _loadAdvertisingPixels();
        }

        // Mostrar banner solo si el usuario no ha decidido aún
        if (!_consent) {
            _showBanner();
        }
    }

    // ================================
    // CONSENTIMIENTO
    // ================================

    function acceptAll() {
        // Marcar consentimiento
        localStorage.setItem('ionik_cookie_consent', 'all');
        _consent = 'all';

        // --- Medida defensiva: eliminar acciones pendientes que puedan abrir tel: ---
        try {
            // Borrar claves conocidas que podrían contener una acción guardada por campañas/ads
            sessionStorage.removeItem('ionik_pending_action');
            localStorage.removeItem('ionik_pending_action');

            // Si por alguna razón hay una URL pendiente en query params, no seguir si es tel:
            var params = new URLSearchParams(window.location.search);
            var pending = params.get('pending_action') || params.get('action');
            if (pending && /^tel:/i.test(pending)) {
                // remover del historial para evitar que scripts la usen
                var cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        } catch (e) {
            console.warn('Error al limpiar acciones pendientes:', e);
        }

        // Cargar píxeles publicitarios (si corresponde)
        _loadAdvertisingPixels();
        _hideBanner();
    }

    function acceptEssential() {
        localStorage.setItem('ionik_cookie_consent', 'essential');
        _consent = 'essential';
        _hideBanner();
    }

    function getConsent() {
        return _consent;
    }

    function _preventClickThrough(banner) {
        if (!banner) return;
        // Guardar handlers para poder removerlos luego (almacenamos en el banner para referencia)
        banner.__clickThroughHandlers = banner.__clickThroughHandlers || [];

        var events = ['touchstart','touchend','touchmove','mousedown','click'];

        // Handler en captura a nivel de documento: si el target está fuera del banner, bloquear el evento.
        var docHandler = function(e) {
            try {
                if (!banner.contains(e.target)) {
                    e.stopPropagation();
                    // Evitar que un click/touch lance acciones nativas (tel:, intent external) que vengan de debajo
                    if (e.type === 'click' || e.type.indexOf('touch') === 0) {
                        e.preventDefault();
                    }
                }
                // Si el target está dentro del banner, permitir la interacción normalmente.
            } catch (err) {
                // no-op
            }
        };

        events.forEach(function(evt){
            document.addEventListener(evt, docHandler, true);
            banner.__clickThroughHandlers.push({ on: 'document', evt: evt, handler: docHandler });
        });
    }

    function _removeClickThrough(banner) {
        if (!banner || !banner.__clickThroughHandlers) return;
        banner.__clickThroughHandlers.forEach(function(item){
            try {
                if (item.on === 'document') {
                    document.removeEventListener(item.evt, item.handler, true);
                } else if (item.el) {
                    item.el.removeEventListener(item.evt, item.handler, true);
                }
            } catch (e) { /* noop */ }
        });
        banner.__clickThroughHandlers = null;
    }

    function _showBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            // Bloquear interacciones con elementos subyacentes (evita overlays de apps/ads que capturan clicks)
            try { document.body.classList.add('cookies-modal-open'); } catch(e) { /* no crítico */ }

            // Pequeño delay para que la animación sea visible tras cargar la página
            setTimeout(function () {
                banner.classList.add('active');

                // Detectar si la página fue abierta desde un in-app browser (Instagram/Facebook) y ajustar posición
                try {
                    var ref = (document.referrer || '').toLowerCase();
                    var ua = (navigator.userAgent || '').toLowerCase();
                    var inApp = ref.indexOf('instagram.com') !== -1 || ref.indexOf('l.facebook.com') !== -1 || ua.indexOf('instagram') !== -1 || ua.indexOf('fbav') !== -1 || ua.indexOf('fban') !== -1;
                    if (inApp) {
                        banner.classList.add('offset');
                    } else {
                        banner.classList.remove('offset');
                    }
                } catch(e) { /* noop */ }

                // Añadir captura de eventos para evitar que el toque 'atraviese' el banner
                try { _preventClickThrough(banner); } catch(e) { /* noop */ }
            }, 800);
        }
    }

    function _hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;
        banner.classList.remove('active');
        try { _removeClickThrough(banner); } catch(e) { /* noop */ }
        setTimeout(function () { banner.style.display = 'none'; try { document.body.classList.remove('cookies-modal-open'); } catch(e) {} }, 400);
    }

    // ================================
    // CARGA DINÁMICA DE PÍXELES
    // Solo se ejecuta con consentimiento 'all'
    // ================================

    function _loadAdvertisingPixels() {
        _loadMetaPixel();
        _loadTikTokPixel();
    }

    function _loadMetaPixel() {
        if (typeof fbq !== 'undefined') return; // ya inicializado

        /* global fbq */
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', META_PIXEL_ID);
        fbq('track', 'PageView');
    }

    function _loadTikTokPixel() {
        if (typeof ttq !== 'undefined') return; // ya inicializado

        !function (w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = w[t] = w[t] || [];
            ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
                'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent',
                'revokeConsent', 'grantConsent'];
            ttq.setAndDefer = function (t, e) {
                t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
            };
            for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
            ttq.instance = function (t) {
                for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                return e;
            };
            ttq.load = function (e, n) {
                var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r;
                ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
                ttq._o = ttq._o || {}; ttq._o[e] = n || {};
                n = document.createElement('script'); n.type = 'text/javascript';
                n.async = !0; n.src = r + '?sdkid=' + e + '&lib=' + t;
                e = document.getElementsByTagName('script')[0];
                e.parentNode.insertBefore(n, e);
            };
            ttq.load(TIKTOK_PIXEL_ID); 
            ttq.page();
        }(window, document, 'ttq');
    }

    // ================================
    // EVENTO CENTRALIZADO
    // trackEvent(nombre, datos)
    // ================================

    function trackEvent(eventName, data) {
        data = data || {};

        // --- dataLayer (compatible con GTM futuro) ---
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: eventName }, data));

        // --- Google Analytics 4 (siempre activo — análitica) ---
        if (typeof gtag !== 'undefined') {
            _fireGA4(eventName, data);
        }

        // --- Meta Pixel y TikTok (solo con consentimiento publicitario) ---
        if (_consent === 'all') {
            if (typeof fbq !== 'undefined') _fireMeta(eventName, data);
            if (typeof ttq !== 'undefined') _fireTikTok(eventName, data);
        }
    }

    // ================================
    // MAPEO GA4
    // ================================

    function _fireGA4(eventName, d) {
        var map = {
            'add_to_cart': function () {
                gtag('event', 'add_to_cart', {
                    currency: 'CLP',
                    value: d.value,
                    items: [{ item_id: d.content_id, item_name: d.content_name, price: d.value, quantity: d.quantity || 1, item_category: d.category || '' }]
                });
            },
            'view_item': function () {
                gtag('event', 'view_item', {
                    currency: 'CLP',
                    value: d.value,
                    items: [{ item_id: d.content_id, item_name: d.content_name, price: d.value, item_category: d.category || '' }]
                });
            },
            'view_item_list': function () {
                gtag('event', 'view_item_list', {
                    item_list_name: 'Catálogo Ionik',
                    items: d.items || []
                });
            },
            'begin_checkout': function () {
                gtag('event', 'begin_checkout', {
                    currency: 'CLP',
                    value: d.value,
                    items: d.items || []
                });
            },
            'purchase': function () {
                gtag('event', 'purchase', {
                    transaction_id: d.order_id,
                    value: d.value,
                    currency: 'CLP',
                    items: d.items || []
                });
            },
            'generate_lead': function () {
                gtag('event', 'generate_lead', {
                    method: d.method || 'whatsapp',
                    source: d.location || 'unknown'
                });
            }
        };
        if (map[eventName]) map[eventName]();
    }

    // ================================
    // MAPEO META PIXEL
    // ================================

    function _fireMeta(eventName, d) {
        var map = {
            'add_to_cart': function () {
                fbq('track', 'AddToCart', {
                    content_name: d.content_name,
                    content_ids: [d.content_id],
                    content_type: 'product',
                    value: d.value,
                    currency: 'CLP'
                });
            },
            'view_item': function () {
                fbq('track', 'ViewContent', {
                    content_name: d.content_name,
                    content_ids: [d.content_id],
                    content_type: 'product',
                    value: d.value,
                    currency: 'CLP'
                });
            },
            'begin_checkout': function () {
                fbq('track', 'InitiateCheckout', {
                    value: d.value,
                    currency: 'CLP',
                    num_items: d.num_items || 1
                });
            },
            'purchase': function () {
                fbq('track', 'Purchase', {
                    value: d.value,
                    currency: 'CLP',
                    content_type: 'product'
                });
            },
            'generate_lead': function () {
                fbq('track', 'Lead', {
                    content_name: d.method || 'whatsapp',
                    content_category: d.location || 'unknown'
                });
            }
        };
        if (map[eventName]) map[eventName]();
    }

    // ================================
    // MAPEO TIKTOK PIXEL
    // TikTok requiere: contents[] con content_id/price/quantity + value total
    // ================================

    function _fireTikTok(eventName, d) {
        var map = {
            'add_to_cart': function () {
                ttq.track('AddToCart', {
                    contents: [{
                        content_id:   String(d.content_id),
                        content_name: d.content_name,
                        quantity:     d.quantity || 1,
                        price:        d.value
                    }],
                    value:    d.value,
                    currency: 'CLP'
                });
            },
            'view_item': function () {
                ttq.track('ViewContent', {
                    contents: [{
                        content_id:   String(d.content_id),
                        content_name: d.content_name,
                        quantity:     1,
                        price:        d.value
                    }],
                    value:    d.value,
                    currency: 'CLP'
                });
            },
            'begin_checkout': function () {
                var contents = (d.items || []).map(function(item) {
                    return {
                        content_id:   String(item.item_id),
                        content_name: item.item_name,
                        quantity:     item.quantity || 1,
                        price:        item.price
                    };
                });
                ttq.track('InitiateCheckout', {
                    contents: contents.length ? contents : [{ content_id: 'cart', quantity: d.num_items || 1, price: d.value }],
                    value:    d.value,
                    currency: 'CLP'
                });
            },
            'purchase': function () {
                var contents = (d.items || []).map(function(item) {
                    return {
                        content_id:   String(item.item_id),
                        content_name: item.item_name,
                        quantity:     item.quantity || 1,
                        price:        item.price
                    };
                });
                // TikTok requiere "CompletePayment" para e-commerce (Purchase es alternativo)
                ttq.track('CompletePayment', {
                    contents: contents.length ? contents : [{ content_id: 'order', quantity: 1, price: d.value }],
                    value:    d.value,
                    currency: 'CLP'
                });
            },
            'generate_lead': function () {
                ttq.track('Contact', {
                    contents: [{ content_id: d.method || 'whatsapp', content_name: d.location || 'unknown' }]
                });
            }
        };
        if (map[eventName]) map[eventName]();
    }

    // ================================
    // API PÚBLICA
    // ================================

    return {
        init:             init,
        acceptAll:        acceptAll,
        acceptEssential:  acceptEssential,
        getConsent:       getConsent,
        trackEvent:       trackEvent
    };

})();

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', function () {
    IonkAnalytics.init();
});
