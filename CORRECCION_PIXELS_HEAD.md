# Corrección de Carga de Pixels en HEAD

## Fecha: 2026-06-15

## Problemas Detectados

### 1. Error: GOOGLE_ANALYTICS_ID is not defined
**Causa**: El script intentaba usar `GOOGLE_ANALYTICS_ID` antes de que `analytics.js` estuviera cargado.
- `analytics.js` se cargaba al final del `<body>`
- Los scripts inline que usaban las variables se ejecutaban antes

### 2. TikTok Pixel no detectado
**Error TikTok**: "We can't detect pixel D8O1VKBC77U23F8ET2K0 base code on your page"
**Causa**: TikTok necesita ver el código base del pixel directamente en el HTML para validación, no puede detectarlo si se carga condicionalmente o desde archivos externos.

## Solución Implementada

### ✅ Movimos analytics.js al `<head>`
```html
<script src="js/analytics.js?v=20260615"></script>
```
Ahora las variables `GOOGLE_ANALYTICS_ID`, `META_PIXEL_ID`, `TIKTOK_PIXEL_ID` están disponibles inmediatamente.

### ✅ Agregamos Google Analytics dinámicamente en HEAD
```javascript
(function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS_ID;
    document.head.appendChild(script);
})();

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', GOOGLE_ANALYTICS_ID);
```

### ✅ Agregamos TikTok Pixel Base Code en HEAD
```javascript
!function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
    ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
    n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;
    e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
}(window, document, 'ttq');
```

### ✅ Eliminamos código duplicado del `<body>`
- Removimos la carga duplicada de `analytics.js` en el body
- Removimos el código duplicado de Google Analytics

## Resultado Final

### Estructura de Carga en `<head>`:
1. **analytics.js** → Define variables centralizadas
2. **Google Analytics** → Carga dinámica usando `GOOGLE_ANALYTICS_ID`
3. **TikTok Pixel** → Código base usando `TIKTOK_PIXEL_ID`

### IDs Activos:
- `GOOGLE_ANALYTICS_ID = 'G-EWHZNB26KC'`
- `META_PIXEL_ID = '2691134951266093'`
- `TIKTOK_PIXEL_ID = 'D8O1VKBC77U23F8ET2K0'`

## Verificación

### Para Google Analytics:
1. Abrir consola del navegador
2. No debe mostrar error `GOOGLE_ANALYTICS_ID is not defined`
3. Verificar en Network que `gtag/js?id=G-EWHZNB26KC` se carga correctamente

### Para TikTok Pixel:
1. Ir a TikTok Events Manager → Pixel → Test Events
2. Debería detectar el código base automáticamente
3. El mensaje de error "We can't detect pixel base code" debe desaparecer

### Para Meta Pixel:
1. Meta Pixel se carga condicionalmente (con consentimiento de cookies)
2. Verificar en Network que `fbevents.js` se carga después de aceptar cookies

## Notas Importantes

- ✅ **Centralización mantenida**: Todos los IDs siguen en `analytics.js`
- ✅ **Cero hardcoding**: Se usan variables en todo momento
- ✅ **Validación TikTok**: El código base visible permite validación automática
- ✅ **Performance**: Scripts se cargan async, no bloquean renderizado
- ⚠️ **Versión cache-busting**: Se actualizó a `?v=20260615` para forzar recarga

## Archivos Modificados

- `index.html` (head: líneas 100-133, body: limpieza de duplicados)
- Versión actualizada: `?v=20260615`
