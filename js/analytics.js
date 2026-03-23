// ================================
// ANALYTICS CENTRALIZADO — IONIK
// Capa única de tracking compatible con
// GA4, Meta Pixel, TikTok Pixel y GTM futuro
// ================================

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
        localStorage.setItem('ionik_cookie_consent', 'all');
        _consent = 'all';
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

    function _showBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            // Pequeño delay para que la animación sea visible tras cargar la página
            setTimeout(function () {
                banner.classList.add('active');
            }, 800);
        }
    }

    function _hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;
        banner.classList.remove('active');
        setTimeout(function () { banner.style.display = 'none'; }, 400);
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

        fbq('init', '2691134951266093');
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
            ttq.load('D7011T3C77U1ODGOP02G');
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
                ttq.track('PlaceAnOrder', {
                    contents: contents.length ? contents : [{ content_id: 'order', quantity: 1, price: d.value }],
                    value:    d.value,
                    currency: 'CLP'
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
