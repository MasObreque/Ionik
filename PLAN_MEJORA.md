# Plan de Mejora IonikHome — Conversión Móvil y UX

> **Estado:** ✅ IMPLEMENTADO — 2026-04-01
> Basado en análisis de Google Analytics y revisión del código fuente

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

---

## Fase 0 — Auditoría Móvil de Estilos e Imágenes

> Basada en revisión completa de los archivos CSS y análisis del inventario de imágenes/videos

### Problemas Críticos de CSS Móvil

#### 🔴 CRÍTICOS — Afectan directamente la experiencia visual

| # | Problema | Archivo | Línea | Solución |
|---|----------|---------|-------|----------|
| 1 | **Contenedor de imagen fijo 300px** — distorsiona imágenes en distintas proporciones | `components.css` | 42 | Cambiar a `aspect-ratio: 4/3` + `height: auto` |
| 2 | **Imágenes de producto sin `loading="lazy"`** — descarga todo al entrar | `js/products.js` | 275-278 | Agregar `loading="lazy" width="300" height="300"` |
| 3 | **Hero background 70% de ancho** — no se adapta a móvil, imagen recortada | `style.css` | 337 | `@media (max-width: 768px) { width: 100%; }` |
| 4 | **Botones de cantidad 30×30px** — por debajo del mínimo táctil de 44px | `components.css` | 259-270 | Cambiar a `min-width: 44px; min-height: 44px` |
| 5 | **Imagen hero sin atributos `width/height`** — causa Layout Shift (CLS) | `index.html` | 176-180 | Agregar dimensiones + `fetchpriority="high"` |

#### 🟠 ALTOS — Degradan la experiencia pero no la rompen

| # | Problema | Archivo | Línea | Solución |
|---|----------|---------|-------|----------|
| 6 | **Hero con `padding-top: 120px` en móvil** — usuario no ve productos sin scroll | `responsive.css` | 85 | Reducir a 60px en 768px, 45px en 480px |
| 7 | **`padding: 60px 40px` en product-card-hero** — excesivo en 768px | `responsive.css` | 121 | Reducir a 30px 20px |
| 8 | **Imagen del carrito fija 80×80px** — distorsionada en móvil | `components.css` | 226-231 | Usar `aspect-ratio: 1` con `width: 70px` |
| 9 | **Clip-paths del hero no son responsivos** — formas diagonales se ven raras en móvil | `style.css` | 366-374 | Override en 768px con clip-path más simple o `none` |
| 10 | **Header con solo 10px de padding vertical** — áreas táctiles pequeñas | `style.css` | 100-105 | Garantizar altura mínima de 60px en header |

#### 🟡 MEDIOS — Mejoras de performance y experiencia

| # | Problema | Archivo | Línea | Solución |
|---|----------|---------|-------|----------|
| 11 | **Video 8.92 MB sin `preload="none"`** — descarga automática en móvil consume datos | `index.html` | 216-225 | Agregar `preload="none"` |
| 12 | **Secciones beneficios/testimonios sin ajustes en 768px** — padding no optimizado | `responsive.css` | — | Agregar reglas específicas de padding |

### Inventario de Imágenes — Problemas de Peso

| Imagen | Tamaño | Problema | Acción |
|--------|--------|----------|--------|
| `producto11.png` | **3.4 MB** | PNG fotográfico, enorme | Convertir a WebP/JPEG, máx 300 KB |
| `lampara3.png` | **2.9 MB** | PNG fotográfico | Convertir a WebP/JPEG, máx 250 KB |
| `lampara2.png` | **1.4 MB** | PNG fotográfico | Convertir a WebP/JPEG, máx 200 KB |
| `CargadorAuto1.png` | **1.1 MB** | PNG fotográfico | Convertir a WebP/JPEG, máx 150 KB |
| `luzfria.jpeg` | **1.3 MB** | JPEG sin comprimir | Comprimir al 80%, máx 200 KB |
| `lampara1.jpg` | **988 KB** | Imagen hero principal | Comprimir + agregar versión WebP |
| `ResolucionFullHD.jpeg` | **260 KB** | OK pero sin versión móvil | Crear versión 768px ancho |

> **Total estimado descargado hoy en móvil:** ~12–15 MB de imágenes + 8.9 MB de video = **~23 MB en primera visita**
> **Meta post-optimización:** < 3 MB total en primera visita móvil

### Todos de la Fase Móvil

#### CSS — Correcciones de Estilos

- **[css-image-aspect-ratio]** Reemplazar `height: 300px` fijo en `.product-image-container` por `aspect-ratio: 4/3` con `height: auto`. Corregir también en `responsive.css` en 480px.
  - `components.css` línea 42 + `responsive.css` línea 280

- **[css-touch-targets]** Aumentar botones de cantidad de 30×30px a mín 44×44px. Verificar todos los botones interactivos.
  - `components.css` líneas 259-270

- **[css-hero-responsive]** 
  - Corregir `.hero-background-image` width 70% → 100% en mobile
  - Corregir clip-paths en 768px (simplificar a línea vertical o eliminar)
  - Reducir `padding-top` de 120px → 60px en 768px
  - `style.css` línea 337, 366-374 + `responsive.css` línea 85

- **[css-cart-image]** Cambiar imagen del carrito a `aspect-ratio: 1` en lugar de altura fija.
  - `components.css` líneas 226-231

- **[css-header-height]** Garantizar header mínimo 60px de altura en móvil, especialmente con `.header-slim`.
  - `style.css` líneas 100-105

#### HTML — Atributos de Imágenes y Video

- **[html-hero-image-attrs]** Agregar a la imagen del hero: `width`, `height`, `fetchpriority="high"` y considerar convertirla a CSS background-image para evitar CLS.
  - `index.html` líneas 176-180

- **[html-video-preload]** Agregar `preload="none"` al video del hero para evitar descarga automática en móvil.
  - `index.html` líneas 216-225

#### JavaScript — Imágenes de Productos

- **[js-lazy-loading]** Agregar `loading="lazy"` + atributos `width="300"` `height="300"` en todas las imágenes generadas dinámicamente en `createProductCard()`.
  - `js/products.js` líneas 275-278

#### Imágenes — Compresión y Formatos

- **[img-compress-png]** Comprimir/convertir los PNG fotográficos grandes:
  - `producto11.png` (3.4 MB → < 300 KB)
  - `lampara3.png` (2.9 MB → < 250 KB)
  - `lampara2.png` (1.4 MB → < 200 KB)
  - `CargadorAuto1.png` (1.1 MB → < 150 KB)
  - Herramienta recomendada: [squoosh.app](https://squoosh.app) o TinyPNG

- **[img-compress-jpeg]** Comprimir JPEG sin comprimir:
  - `luzfria.jpeg` (1.3 MB → < 200 KB)
  - `lampara1.jpg` (988 KB → < 200 KB)
  - `ResolucionFullHD.jpeg` — crear versión 768px para móvil

> ⚠️ La compresión de imágenes debe hacerse **manualmente** (fuera del código) con herramientas externas. El plan de código asume que las imágenes ya fueron optimizadas.

---

## Archivos a Modificar

| Archivo | Cambios previstos |
|---------|-------------------|
| `index.html` | Cache headers, iconos de pago, WhatsApp tracking, hero image attrs, video preload |
| `css/style.css` | Clase `.header-slim`, fix hero background-image width |
| `css/responsive.css` | Padding hero (768px, 480px), product-card-hero padding, clip-paths mobile |
| `css/components.css` | `aspect-ratio` imágenes, touch targets botones, payment trust bar, free shipping bar |
| `js/main.js` | Header slim en scroll, deep linking `?item=` y `?categoria=`, checkout feedback |
| `js/cart.js` | Barra "te faltan $X para envío gratis" en `updateCartDisplay()` |
| `js/products.js` | `loading="lazy"` en imágenes, botón MercadoLibre en card |
| `images/` | Comprimir PNG/JPEG grandes (acción manual externa al código) |
