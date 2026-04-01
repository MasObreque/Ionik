# Estado de Implementación — SEO y Píxeles de Publicidad
**Proyecto:** Ionik (ionik.cl) · **Última actualización:** Marzo 2026

---

## ✅ Completado

### SEO Técnico — `index.html`
- [x] `<title>` optimizado con palabras clave
- [x] `<meta name="description">` con CTA e keywords
- [x] `<meta name="keywords">` en español
- [x] `<link rel="canonical">` apuntando a `https://ionik.cl`
- [x] Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- [x] Twitter Card (`summary_large_image`)
- [x] `images/og-preview_mini.jpg` creada y referenciada ✅
- [x] JSON-LD `Organization` (nombre, logo, contacto, redes sociales)
- [x] JSON-LD `WebSite` con `SearchAction`
- [x] `robots.txt` (permite todo, apunta al sitemap)
- [x] `sitemap.xml` (home + 4 páginas legales)

### SEO por Producto — `products.js`
- [x] JSON-LD `Product` inyectado dinámicamente por cada tarjeta (`injectProductSchema`)
- [x] Incluye precio, stock, marca, imagen, rating y reseñas

### Tracking — `js/analytics.js` (centralizado)
- [x] Módulo `IonkAnalytics` con patrón IIFE
- [x] GA4 (`G-1TQV3P3CNY`) carga en `<head>` — siempre activo
- [x] Meta Pixel (`1243580607965158`) — **carga dinámica solo con consentimiento**
- [x] TikTok Pixel (`D7011T3C77U1ODGOP02G`) — **carga dinámica solo con consentimiento**
- [x] `trackEvent(nombre, datos)` centralizado → mapea a GA4 + Meta + TikTok
- [x] Compatible con `window.dataLayer` (preparado para GTM futuro)

### Eventos implementados
| Evento          | GA4              | Meta Pixel        | TikTok Pixel   | Dónde se dispara              |
|-----------------|------------------|-------------------|----------------|-------------------------------|
| `view_item_list`| `view_item_list` | —                 | —              | Al cargar el catálogo         |
| `view_item`     | `view_item`      | `ViewContent`     | `ViewContent`  | Clic en tarjeta de producto   |
| `add_to_cart`   | `add_to_cart`    | `AddToCart`       | `AddToCart`    | Botón "Agregar al carrito"    |
| `begin_checkout`| `begin_checkout` | `InitiateCheckout`| `InitiateCheckout` | Botón "Finalizar compra"  |
| `purchase`      | `purchase`       | `Purchase`        | `PlaceAnOrder` | Confirmación → abre WhatsApp  |

### Consentimiento de Cookies
- [x] Banner fijo en la parte inferior de la pantalla
- [x] Botón "Aceptar todas" → activa Meta Pixel + TikTok
- [x] Botón "Solo esenciales" → solo GA4
- [x] Decisión guardada en `localStorage` key `ionik_cookie_consent`
- [x] Diseño responsivo (mobile y desktop)

### Páginas Legales — `legal/`
- [x] `terminos-y-condiciones.html`
- [x] `politica-de-privacidad.html` (menciona GA4, Meta Pixel, TikTok Pixel)
- [x] `politica-de-devoluciones.html`
- [x] `garantia.html`
- [x] Todas incluyen tracking inline (GA4 + Meta + TikTok)
- [x] Links desde el footer de `index.html`
- [x] Incluidas en `sitemap.xml`

---

## ⏳ Pendiente — Sin Backend (Frontend only)

### Alta prioridad
- [ ] **Verificar datos reales en GA4** → abrir [analytics.google.com](https://analytics.google.com), confirmar que llegan eventos `view_item_list`, `add_to_cart`, etc.
- [ ] **Verificar Meta Pixel** → usar [Meta Pixel Helper](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) (extensión Chrome)
- [ ] **Verificar TikTok Pixel** → usar [TikTok Pixel Helper](https://chromewebstore.google.com/detail/tiktok-pixel-helper/aelgobmabdmlfmiblddjfnjodalhplbb)
- [ ] **Google Search Console** → agregar propiedad `ionik.cl` y subir `sitemap.xml`
- [ ] **Bing Webmaster Tools** → subir sitemap (tráfico adicional gratuito)
- [ ] **`og-preview.jpg`** → verificar que tenga al menos 1200×630 px para verse bien al compartir

### Media prioridad
- [ ] **`minimalista1.png`** → imagen de producto faltante en `images/` (genera error en consola)
- [ ] **Casing de archivos** → revisar nombres de imágenes antes de subir a producción en Linux (ej. `CargadorAuto1.png` vs `cargadorauto1.png`)
- [ ] **Evento `Purchase` real** → actualmente se dispara al abrir WhatsApp; debe moverse a confirmación real de pago cuando se integre Transbank o Mercado Pago
- [ ] **Páginas legales** → refactorizar tracking inline para usar `analytics.js` (actualmente tienen píxeles hardcodeados en su `<head>`)
- [ ] **Actualizar `sitemap.xml`** → agregar fecha `<lastmod>` cada vez que se publique un cambio relevante

### Baja prioridad
- [ ] **Favicon SVG** → actualmente el `<link rel="icon">` apunta a `images/logo_mini.jpg`, idealmente usar un `.ico` o `.svg` cuadrado
- [ ] **`hreflang`** → si en el futuro se agrega versión en inglés
- [ ] **Velocidad PageSpeed** → correr [PageSpeed Insights](https://pagespeed.web.dev/) y optimizar imágenes (convertir a WebP)

---

## 🔮 Pendiente — Requiere Backend (Fases 4-9 del Roadmap)

| Fase | Descripción |
|------|-------------|
| 4 | API Express + Node.js para productos, órdenes e imágenes |
| 5 | Base de datos Oracle Cloud (ejecutar `ESQUEMASQL/schema.sql`) |
| 6 | Páginas individuales por producto (`/producto/cargador-3en1`) |
| 7 | SEO dinámico por página de producto (meta tags, JSON-LD, canonical) |
| 8 | Integración Transbank WebPay o Mercado Pago → evento `Purchase` real |
| 9 | Panel admin (`admin/upload-products.html`) conectado al backend |

Ver detalle completo en `ROADMAP_TECNICO_IMPLEMENTACION_SEO_PIXEL_Y_BACKEND.md`.

---

## IDs de Plataformas

| Plataforma | ID |
|---|---|
| Google Analytics 4 | `G-1TQV3P3CNY` |
| Meta Pixel | `1243580607965158` |
| TikTok Pixel | `D7011T3C77U1ODGOP02G` |

> IDs completos en `plataforma_id.md`

---

## Notas técnicas

- **Orden de carga de scripts** (final de `<body>`): `analytics.js` → `main.js` → `cart.js` → `products.js`
- **GA4 siempre activo** (analítica); Meta + TikTok solo con consentimiento `'all'`
- **`IonkAnalytics.trackEvent(nombre, datos)`** es el único punto de entrada para todos los eventos
- **`localStorage`** key `ionik_cookie_consent`: valores `'all'` | `'essential'` | `null`

