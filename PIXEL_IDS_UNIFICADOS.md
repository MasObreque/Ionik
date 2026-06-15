# 📊 PÍXELES UNIFICADOS - IONIK

## ✅ Centralización Completada

Todos los IDs de píxeles de tracking ahora están centralizados en **UN SOLO ARCHIVO**: `js/analytics.js`

---

## 📁 Archivo de Configuración

### **`js/analytics.js`** (único archivo centralizado)
Todas las variables están al inicio de este archivo. Se carga en:
- `index.html` (página principal)
- Todas las páginas `/legal/*.html`

---

## 🎯 IDs Activos (en uso)

```javascript
// Google Analytics 4
const GOOGLE_ANALYTICS_ID = 'G-EWHZNB26KC';

// Meta Pixel (Facebook)
const META_PIXEL_ID = '2691134951266093';

// TikTok Pixel
const TIKTOK_PIXEL_ID = '7620108218437500935';
```

---

## 💡 IDs Alternativos (comentados - no se usan)

Los IDs antiguos que estaban en las páginas legales están documentados pero comentados:

```javascript
// const GOOGLE_ANALYTICS_ID_ALT = 'G-1TQV3P3CNY';
// const META_PIXEL_ID_ALT = '1243580607965158';
// const TIKTOK_PIXEL_ID_ALT = 'D7011T3C77U1ODGOP02G';
```

**Razón:** Se encontraron IDs diferentes entre:
- `index.html` (principal) → IDs activos
- `/legal/*.html` (páginas legales) → IDs antiguos

**Decisión:** Unificar todo usando los IDs de `index.html` como estándar.

---

## 📄 Archivos Actualizados

### ✅ Archivo principal:
- **`js/analytics.js`** ← ÚNICO archivo con variables centralizadas

### ✅ Páginas que cargan analytics.js:
- **`index.html`** (ya lo cargaba)
- **`legal/garantia.html`** ← ahora carga analytics.js
- **`legal/politica-de-privacidad.html`** ← ahora carga analytics.js
- **`legal/politica-de-devoluciones.html`** ← ahora carga analytics.js
- **`legal/terminos-y-condiciones.html`** ← ahora carga analytics.js

### ✅ Carga dinámica de Google Analytics:
Todas las páginas ahora cargan el script de Google Analytics dinámicamente usando la variable:

```javascript
// Antes (hardcoded):
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EWHZNB26KC"></script>

// Ahora (usa variable):
var script = document.createElement('script');
script.async = true;
script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS_ID;
```

---

## 🔄 Cómo usar

### Para cambiar un ID de píxel:

**Antes** (fragmentado en múltiples archivos):
```javascript
// En analytics.js
fbq('init', '2691134951266093');

// En garantia.html
fbq('init', '1243580607965158');
<script async src="...?id=G-EWHZNB26KC"></script>

// En otros archivos
fbq('init', 'OTRO_ID_DIFERENTE');
<script async src="...?id=G-1TQV3P3CNY"></script>
```

**Ahora** (centralizado en UN SOLO lugar):
1. Editar **UNA SOLA VEZ** en `js/analytics.js`:
   ```javascript
   const META_PIXEL_ID = 'NUEVO_ID_AQUI';
   const GOOGLE_ANALYTICS_ID = 'G-NUEVO_ID';
   const TIKTOK_PIXEL_ID = 'NUEVO_TIKTOK_ID';
   ```

2. Automáticamente se aplica en:
   - `index.html`
   - **TODAS** las páginas `/legal/*.html`
   - **TODOS** los scripts que usan las variables
   - **Incluso en las URLs** (Google Analytics se carga dinámicamente)

---

## 🛠️ Ejemplo de cambio

Si necesitas cambiar el TikTok Pixel:

```javascript
// js/analytics.js (líneas 20-22)
const TIKTOK_PIXEL_ID = '1234567890123456789'; // NUEVO ID
```

Eso es todo. No necesitas tocar **ningún** HTML.

---

## 📊 Resumen de IDs encontrados durante la auditoría

### Google Analytics (GA4)
| ID | Ubicación Original | Estado |
|----|-------------------|---------|
| `G-EWHZNB26KC` | index.html | ✅ **ACTIVO** |
| `G-1TQV3P3CNY` | legal/*.html | ⚠️ Comentado (alternativo) |

### Meta Pixel (Facebook)
| ID | Ubicación Original | Estado |
|----|-------------------|---------|
| `2691134951266093` | analytics.js | ✅ **ACTIVO** |
| `1243580607965158` | legal/*.html | ⚠️ Comentado (alternativo) |

### TikTok Pixel
| ID | Ubicación Original | Estado |
|----|-------------------|---------|
| `7620108218437500935` | analytics.js, garantia.html | ✅ **ACTIVO** |
| `D7011T3C77U1ODGOP02G` | legal/*.html (otros) | ⚠️ Comentado (alternativo) |

---

## ⚡ Ventajas de la centralización

1. ✅ **UN SOLO ARCHIVO** para actualizar todos los IDs
2. ✅ **Consistencia total** en toda la tienda
3. ✅ **Cero hardcoding** - hasta las URLs se construyen dinámicamente
4. ✅ **Fácil mantenimiento** - no buscar en 5 archivos HTML
5. ✅ **Documentación clara** de IDs alternativos

---

## 🚨 Importante

### Estructura actual:
```
js/
  analytics.js          ← Variables centralizadas al inicio (líneas 12-22)
                        ← Sistema completo de analytics
index.html              ← Carga analytics.js
legal/
  garantia.html         ← Carga analytics.js, usa variables
  politica-de-privacidad.html  ← Carga analytics.js, usa variables
  politica-de-devoluciones.html ← Carga analytics.js, usa variables
  terminos-y-condiciones.html  ← Carga analytics.js, usa variables
```

### No hay archivos duplicados:
- ❌ `analytics-config.js` **ELIMINADO** (ya no existe)
- ✅ Solo `analytics.js` con TODO centralizado

---

**Fecha de unificación:** 2026-06-15  
**Archivos modificados:** 5 archivos HTML + 1 JS  
**Archivos eliminados:** `js/analytics-config.js`  
**Resultado:** 100% unificado en `js/analytics.js`

