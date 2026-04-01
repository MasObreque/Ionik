# Plan de Mejora IonikHome — Conversión Móvil y UX

> Generado el 2026-04-01 | Basado en análisis de Google Analytics y revisión del código fuente

---

## Problema Central

Google Analytics muestra que la mayoría del tráfico proviene de móviles, pero la tasa de conversión a pago es **0%**. Los usuarios llegan desde anuncios de Meta/TikTok a la home genérica, el hero ocupa demasiado espacio en móvil sin mostrar productos, el único método de pago visible es Transferencia Bancaria (Webpay/MercadoPago están **comentados** en el código), y no existe mecanismo para llevar al usuario directamente al producto anunciado.

---

## Diagnóstico Técnico

| Área | Problema encontrado | Archivo / Línea |
|------|---------------------|-----------------|
| Cache | `no-cache, no-store` fuerza descarga completa en cada visita | `index.html` líneas 6-9 |
| Métodos de pago | Webpay y MercadoPago **comentados**, solo Transferencia activa | `main.js` líneas 788-800 |
| Iconos de pago | No hay iconos Webpay/Visa/MC bajo "Proceder al Pago" | `index.html` líneas 162-167 |
| Envío gratis | No hay indicador "Te faltan $X" dentro del carrito | `cart.js` líneas 68-109 |
| MercadoLibre | Botón de fuga en el Hero principal | `index.html` líneas 202-211 |
| Deep linking | No existe manejo de `?item=` ni `?categoria=` | `main.js` — ausente |
| Hero móvil | `padding-top: 120px` — usuario no ve productos sin scroll | `css/responsive.css` línea 84 |
| Header | No se adelgaza en scroll móvil, ocupa espacio | `css/style.css` líneas 91-151 |
| WhatsApp tracking | Clic en WhatsApp no dispara evento Lead en GA4 | `index.html` footer |
| LCP | Imagen hero sin `fetchpriority="high"` | `index.html` líneas 176-180 |

---

## Sistema de URLs para Publicidad (Deep Linking)

Esta es la parte más importante para mejorar el ROI de los anuncios. Actualmente todos los anuncios apuntan a `ionik.cl` y el usuario llega al hero sin ver el producto que vio en el anuncio. La solución usa **dos mecanismos** que ya existen en todos los navegadores modernos:

---

### Mecanismo 1 — Anclaje con `#` (Hash Fragment)

**¿Cómo funciona?**

El `#` en una URL le dice al navegador: *"ve a esta página y desplázate hasta el elemento con ese ID"*. No requiere código JavaScript extra — es comportamiento nativo del navegador.

```
ionik.cl/#productos
         ^^^^^^^^^^^
         El navegador busca <section id="productos"> y hace scroll hasta ahí
```

**En el código actual**, la sección ya tiene el ID correcto:
```html
<!-- index.html línea 236 -->
<section id="productos" ...>
```

**Uso en anuncios:**
- Anuncio general de productos → `https://ionik.cl/#productos`
- El usuario llega y ve la vitrina directamente, sin ver el hero

**Limitación:** Lleva a la sección completa, no a un producto específico.

---

### Mecanismo 2 — Parámetro `?item=` (Query Parameter)

**¿Cómo funciona?**

El `?item=` es un parámetro de URL que el navegador pasa al JavaScript. El código JS lo lee con `URLSearchParams`, busca el elemento correspondiente en la página y hace scroll suave hasta él.

```
ionik.cl/?item=prod-001
              ^^^^^^^^^
              JS lee este valor → busca el div con id="product-prod-001" → scroll
```

**En el código actual**, cada product card ya tiene un ID generado automáticamente:
```javascript
// products.js línea 294 — ya existe
`id="product-${product.id}"`
// Resultado: id="product-prod-001", id="product-prod-002", etc.
```

**El código JS que agregaremos** al final de `main.js`:
```javascript
// Se ejecuta cuando la página termina de cargar (incluyendo los productos)
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('item');        // Lee ?item=prod-001
    const categoria = params.get('categoria'); // Lee ?categoria=cargadores

    // Manejo de ?item=
    if (itemId) {
        // Espera 1.2s para que loadProducts() termine de renderizar los cards
        setTimeout(() => {
            const target = document.getElementById(`product-${itemId}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight visual del producto por 2 segundos
                target.style.outline = '3px solid var(--acento-2)';
                setTimeout(() => target.style.outline = '', 2000);
            }
        }, 1300);
    }

    // Manejo de ?categoria=
    if (categoria) {
        setTimeout(() => {
            // Activa el botón de filtro correspondiente
            const filterBtn = document.querySelector(`[data-filter="${categoria}"]`);
            if (filterBtn) {
                filterBtn.click(); // Reutiliza la lógica de filtro ya existente
            }
            // Scroll a la sección de productos
            document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
        }, 1300);
    }
});
```

**¿Por qué el `setTimeout` de 1.3 segundos?**
Porque `loadProducts()` simula una llamada a API con 1000ms de delay antes de renderizar los cards. Si intentamos hacer scroll antes de que los cards existan en el DOM, no encontramos nada. El 1300ms da margen suficiente.

---

### Mecanismo 3 — Parámetro `?categoria=` (Filtro automático)

**¿Cómo funciona?**

Igual que `?item=` pero en lugar de buscar un producto específico, activa el botón de filtro correspondiente usando `.click()` — reutilizando el código de filtrado que ya existe.

```
ionik.cl/?categoria=cargadores
                    ^^^^^^^^^^
                    JS hace click() en el botón [data-filter="cargadores"]
                    → se activa el filtro existente → solo se muestran cargadores
```

**Los botones de filtro actuales** (ya existen en index.html):
```html
<button data-filter="todos">Todos</button>
<button data-filter="cargadores">Cargadores</button>
<button data-filter="lamparas">Luz de Noche</button>
<button data-filter="Luces Auto">Luces Auto</button>
```

---

### Tabla de URLs para Campañas

| Anuncio en Meta/TikTok | URL de destino |
|------------------------|----------------|
| Campaña general Ionik | `https://ionik.cl/#productos` |
| Anuncio cargador inalámbrico | `https://ionik.cl/?item=prod-001` |
| Anuncio lámpara de noche | `https://ionik.cl/?item=prod-002` |
| Campaña "todos los cargadores" | `https://ionik.cl/?categoria=cargadores` |
| Campaña "luces de noche" | `https://ionik.cl/?categoria=lamparas` |
| Campaña "ofertas" | `https://ionik.cl/?categoria=ofertas` |

> **Nota:** Los IDs exactos (`prod-001`, `prod-002`, etc.) se confirman revisando el array de productos en `js/products.js`.

---

## Todos — Orden de Implementación

### 🔴 Prioridad 1 — Impacto inmediato en conversión

| ID | Tarea | Archivos |
|----|-------|---------|
| `payment-icons` | Agregar iconos Webpay/Visa/MC/MP bajo "Proceder al Pago" | `index.html`, `components.css` |
| `free-shipping-bar` | "Te faltan $X para envío gratis" dentro del carrito | `cart.js`, `components.css` |
| `mercadolibre-move` | Mover botón MercadoLibre del Hero a cada product card | `index.html`, `products.js` |
| `temuco-trust-badge` | Sello "Despacho desde Temuco a todo Chile 🇨🇱" en carrito | `index.html`, `components.css` |

### 🔴 Prioridad 2 — Reducir rebote móvil

| ID | Tarea | Archivos |
|----|-------|---------|
| `hero-mobile-padding` | Reducir padding-top hero: 120px→70px (768px), 70px→50px (480px) | `responsive.css` |
| `header-sticky-slim` | Header más delgado en scroll en móvil | `style.css`, `main.js` |
| `cache-fix` | Cambiar Cache-Control a `max-age=3600` | `index.html` |
| `checkout-speed` | Disable + spinner en botón checkout para evitar doble click | `main.js` |

### 🟠 Prioridad 3 — Deep linking para publicidad

| ID | Tarea | Archivos |
|----|-------|---------|
| `url-item-param` | Implementar `?item=PRODUCT_ID` con scroll + highlight | `main.js` |
| `url-category-param` | Implementar `?categoria=X` con filtro automático | `main.js` |
| `url-anchor-ids` | Documentar todos los IDs disponibles para anuncios | — |

### 🟡 Prioridad 4 — Analytics y Performance

| ID | Tarea | Archivos |
|----|-------|---------|
| `whatsapp-lead-tracking` | Evento `generate_lead` en GA4 al click WhatsApp | `index.html` |
| `image-lazy-loading` | `loading="lazy"` en imágenes de product cards | `products.js` |
| `hero-image-optimize` | `fetchpriority="high"` en imagen hero para LCP | `index.html` |

---

## Archivos a Modificar

| Archivo | Cambios previstos |
|---------|-------------------|
| `index.html` | Cache headers, iconos de pago, WhatsApp tracking, hero image priority |
| `css/style.css` | Clase `.header-slim` |
| `css/responsive.css` | Padding hero en 768px y 480px |
| `css/components.css` | Estilos: payment trust bar, free shipping bar, trust badge |
| `js/main.js` | Header slim en scroll, deep linking `?item=` y `?categoria=`, checkout feedback |
| `js/cart.js` | Barra "te faltan $X para envío gratis" en `updateCartDisplay()` |
| `js/products.js` | Lazy loading imágenes, botón MercadoLibre en card |
