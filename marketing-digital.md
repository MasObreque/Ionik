# 📈 Marketing Digital — Plan de Implementación SEO & Pixels
**Proyecto:** Ionik E-commerce  
**Estado actual:** Sin SEO, sin tracking, sin píxeles  
**Viabilidad:** ✅ Totalmente compatible con la arquitectura estática actual

---

## 🔍 Diagnóstico del Estado Actual

| Elemento | Estado | Impacto |
|----------|--------|---------|
| Meta description | ❌ Ausente | Google no puede generar snippets atractivos |
| Open Graph (redes sociales) | ❌ Ausente | Links compartidos en Instagram/WhatsApp no muestran preview |
| Canonical URL | ❌ Ausente | Riesgo de contenido duplicado |
| Structured Data (JSON-LD) | ❌ Ausente | No aparece en Google Shopping ni rich snippets |
| Google Analytics 4 | ❌ Ausente | Cero datos de usuarios, fuentes de tráfico, conversiones |
| Meta (Facebook) Pixel | ❌ Ausente | No se pueden crear audiencias ni campañas de retargeting |
| TikTok Pixel | ❌ Ausente | Canal activo (@ionik.temuco) sin tracking |
| Eventos de e-commerce | ❌ Ausente | Agregar al carrito, checkout y pedidos no se registran |

**Conclusión:** La página está completamente ciega desde el punto de vista de marketing. Las redes sociales activas (Instagram, TikTok, WhatsApp) no generan ningún dato aprovechable.

---

## ✅ ¿Es posible implementarlo?

**Sí, sin necesidad de backend ni framework.** Al ser un sitio estático con JavaScript vanilla, basta con insertar scripts en el `<head>` y añadir llamadas a funciones en los eventos clave del carrito/checkout ya existentes. No se requiere build, npm ni modificar la arquitectura.

---

## 🎯 ¿Vale la pena?

### Beneficios SEO
- Aparecer en Google cuando alguien busca "cargador inalámbrico Temuco", "luz de noche wifi Chile", etc.
- Mostrar los productos con precio y rating directamente en los resultados de búsqueda (Google Shopping / Rich Snippets)
- Que los links compartidos en WhatsApp/Instagram muestren imagen, título y descripción correctamente

### Beneficios Píxel Meta (Facebook/Instagram)
- Crear audiencias de retargeting con quienes visitaron el sitio o añadieron productos al carrito sin comprar
- Medir exactamente cuántas ventas generó cada campaña pagada
- Crear "audiencias similares" (lookalike) basadas en compradores reales para escalar campañas

### Beneficios TikTok Pixel
- Medir conversiones de los videos de @ionik.temuco directamente
- Retargeting a quienes vieron el sitio desde TikTok

### Beneficios Google Analytics 4 (GA4)
- Saber de dónde viene el tráfico (Google, Instagram, TikTok, WhatsApp directo)
- Ver qué productos se ven más, cuántos añaden al carrito y cuántos completan el pedido
- Analizar tasa de abandono del carrito para optimizar la conversión

---

## 📦 PARTE 1 — SEO On-Page

### 1.1 Meta Tags Básicos
Agregar dentro del `<head>` de `index.html`, **después** del `<title>` existente:

```html
<!-- SEO Básico -->
<meta name="description" content="Ionik — Cargadores inalámbricos, luces de noche y accesorios inteligentes para tu hogar. Envío a todo Chile. Calidad premium al mejor precio.">
<meta name="keywords" content="cargador inalámbrico, luz de noche, accesorios hogar, Ionik, Chile, Temuco, carga inalámbrica">
<meta name="author" content="Ionik - MAGNUTECH SpA">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://ionik.cl/">

<!-- Open Graph (Facebook, Instagram, WhatsApp) -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://ionik.cl/">
<meta property="og:title" content="Ionik — Energía que transforma tu día">
<meta property="og:description" content="Cargadores inalámbricos, luces de noche y accesorios inteligentes. Envío gratis sobre $50.000. Compra por WhatsApp.">
<meta property="og:image" content="https://ionik.cl/images/og-preview.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="es_CL">
<meta property="og:site_name" content="Ionik">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Ionik — Energía que transforma tu día">
<meta name="twitter:description" content="Cargadores inalámbricos y accesorios inteligentes para tu hogar. Envío a todo Chile.">
<meta name="twitter:image" content="https://ionik.cl/images/og-preview.jpg">
```

> **Nota:** Crear imagen `images/og-preview.jpg` (1200×630px) con logo + producto estrella. Es lo que aparece al compartir el link en redes.

---

### 1.2 Structured Data — Organización (JSON-LD)
Agregar al final del `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ionik",
  "legalName": "MAGNUTECH SpA",
  "url": "https://ionik.cl",
  "logo": "https://ionik.cl/images/logo.jpg",
  "description": "Tienda online de cargadores inalámbricos y accesorios inteligentes",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Temuco",
    "addressCountry": "CL"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+56962769503",
    "contactType": "customer service",
    "availableLanguage": "Spanish"
  },
  "sameAs": [
    "https://www.instagram.com/ioniktemuco/",
    "https://www.tiktok.com/@ionik.temuco"
  ]
}
</script>
```

---

### 1.3 Structured Data — Productos (JSON-LD dinámico)
Los productos se cargan dinámicamente desde `products.js`. Agregar esta función en `products.js` para inyectar schema de producto cuando se rendericen las tarjetas:

```javascript
function injectProductSchema(product) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.nombre,
        "description": product.descripcion,
        "image": product.imagenes,
        "brand": { "@type": "Brand", "name": "Ionik" },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "CLP",
            "price": product.precio,
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "Ionik" }
        }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}
```

Llamar `injectProductSchema(product)` dentro del loop que renderiza las tarjetas de producto en `products.js`.

---

## 📦 PARTE 2 — Meta (Facebook/Instagram) Pixel

### 2.1 Instalación del Pixel Base
Agregar en `index.html` dentro del `<head>`, **reemplazar `TU_PIXEL_ID`** con el ID del Pixel de Meta Business Suite:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'TU_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=TU_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->
```

### 2.2 Eventos de E-commerce en main.js / cart.js
Agregar las siguientes llamadas en los puntos clave ya existentes del código:

#### En `cart.js` — función que agrega producto al carrito:
```javascript
// Después de añadir el producto al array del carrito
if (typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', {
        content_name: producto.nombre,
        content_ids: [producto.id],
        content_type: 'product',
        value: producto.precio,
        currency: 'CLP'
    });
}
```

#### En `main.js` — función `proceedToCheckout()` (línea ~339):
```javascript
// Al inicio de proceedToCheckout(), antes de mostrar el modal
if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', {
        value: calcularTotal(), // usar la función de total ya existente
        currency: 'CLP',
        num_items: carrito.length
    });
}
```

#### En `main.js` — función `confirmPayment()` (línea ~452):
```javascript
// Justo antes de abrir WhatsApp con el pedido
if (typeof fbq !== 'undefined') {
    fbq('track', 'Purchase', {
        value: totalPedido,
        currency: 'CLP',
        content_type: 'product'
    });
}
```

---

## 📦 PARTE 3 — TikTok Pixel

### 3.1 Instalación
Agregar en `<head>` **después** del Meta Pixel, **reemplazar `TU_TIKTOK_PIXEL_ID`**:

```html
<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
  ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
  n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=i+"?sdkid="+e+"&lib="+t;
  e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('TU_TIKTOK_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->
```

### 3.2 Eventos TikTok en cart.js / main.js

```javascript
// AddToCart
if (typeof ttq !== 'undefined') {
    ttq.track('AddToCart', {
        content_id: producto.id,
        content_name: producto.nombre,
        quantity: 1,
        price: producto.precio,
        currency: 'CLP'
    });
}

// Checkout iniciado
if (typeof ttq !== 'undefined') {
    ttq.track('InitiateCheckout');
}

// Compra completada
if (typeof ttq !== 'undefined') {
    ttq.track('PlaceAnOrder', {
        value: totalPedido,
        currency: 'CLP'
    });
}
```

---

## 📦 PARTE 4 — Google Analytics 4 (GA4)

### 4.1 Instalación
Agregar en `<head>`, **reemplazar `G-XXXXXXXXXX`** con el ID de medición de GA4:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 4.2 Eventos E-commerce GA4

```javascript
// Vista de producto (al mostrar detalle)
gtag('event', 'view_item', {
    currency: 'CLP',
    value: producto.precio,
    items: [{ item_id: producto.id, item_name: producto.nombre, price: producto.precio }]
});

// Agregar al carrito
gtag('event', 'add_to_cart', {
    currency: 'CLP',
    value: producto.precio,
    items: [{ item_id: producto.id, item_name: producto.nombre, price: producto.precio, quantity: 1 }]
});

// Iniciar checkout
gtag('event', 'begin_checkout', {
    currency: 'CLP',
    value: totalPedido
});

// Compra
gtag('event', 'purchase', {
    transaction_id: numeroOrden,  // "IONIK-" + Date.now() ya existe
    value: totalPedido,
    currency: 'CLP'
});
```

---

## 🗂️ Orden de Implementación Recomendado

| Prioridad | Tarea | Esfuerzo | Impacto |
|-----------|-------|----------|---------|
| 🔴 1 | Meta tags SEO + Open Graph en `<head>` | ~30 min | Alto — mejora inmediata en sharing y Google |
| 🔴 2 | Imagen OG `og-preview.jpg` (1200×630px) | ~1 hora | Alto — crítico para shares en redes |
| 🔴 3 | Meta Pixel base + evento Purchase en `confirmPayment()` | ~30 min | Muy alto — mide ROI de campañas |
| 🟡 4 | GA4 base + evento `add_to_cart` y `purchase` | ~45 min | Alto — datos de comportamiento |
| 🟡 5 | JSON-LD Organización en `<head>` | ~15 min | Medio — presencia en Google |
| 🟢 6 | TikTok Pixel | ~30 min | Medio — solo si hay campañas activas en TikTok |
| 🟢 7 | JSON-LD Productos dinámico en `products.js` | ~1 hora | Medio — Google Shopping / rich snippets |
| 🟢 8 | Eventos intermedios (ViewItem, InitiateCheckout) | ~1 hora | Medio — análisis de embudo |

---

## ⚠️ Consideraciones Importantes

### Privacidad y GDPR/Ley 19.628 (Chile)
- La ley chilena de protección de datos personales **no exige banner de cookies** para sitios solo de analytics, pero es buena práctica incluirlo.
- Si se añaden píxeles publicitarios, se recomienda un aviso simple: *"Usamos cookies para mejorar tu experiencia y mostrarte publicidad relevante."*
- Los scripts de píxel **no deben cargarse** si el usuario rechaza, para cumplir estándares internacionales.

### Cache-Busting
- El sitio usa `?v=20260308` en los CSS y JS. Los scripts de píxeles son externos (CDN de Meta/Google/TikTok), por lo que no necesitan versionado.

### Validación
- **Meta Pixel:** Verificar con [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) (extensión Chrome)
- **GA4:** Verificar con [Google Tag Assistant](https://tagassistant.google.com/)
- **SEO:** Verificar con [Google Rich Results Test](https://search.google.com/test/rich-results)
- **Open Graph:** Verificar con [Open Graph Debugger](https://developers.facebook.com/tools/debug/)

### Dónde Obtener los IDs
| Plataforma | Dónde obtenerlo |
|------------|-----------------|
| Meta Pixel ID | [Meta Business Suite](https://business.facebook.com) → Administrador de eventos → Crear Pixel |
| GA4 Measurement ID | [Google Analytics](https://analytics.google.com) → Crear propiedad → Flujo de datos web |
| TikTok Pixel ID | [TikTok Ads Manager](https://ads.tiktok.com) → Activos → Eventos → Web Events |

---

## 📁 Archivos a Modificar

```
index.html          ← <head>: meta tags, OG, JSON-LD org, todos los pixels
js/main.js          ← confirmPayment(), proceedToCheckout(): eventos Purchase, InitiateCheckout  
js/cart.js          ← función addToCart(): evento AddToCart
js/products.js      ← función de render: injectProductSchema() + ViewItem
images/
  og-preview.jpg    ← NUEVO — imagen 1200×630px para redes sociales
```

> Se eligió **un solo documento** porque SEO y Píxeles están íntimamente relacionados (ambos dependen de los mismos eventos de e-commerce y del mismo `<head>`) y su implementación se hace en paralelo en los mismos archivos. Separarlos generaría duplicación innecesaria.
