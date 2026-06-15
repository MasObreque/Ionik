# TikTok: Event Builder vs Código Programático

## ¿Qué es Event Builder de TikTok?

**Event Builder** es una herramienta visual dentro de TikTok Events Manager que permite:
- Configurar eventos **sin escribir código**
- Hacer clic en elementos de tu página web
- Asignar eventos automáticamente a esos clics
- Ideal para personas sin conocimientos técnicos

## ¿Tu Sitio Necesita Event Builder? 

### ❌ **NO es necesario** — Ya tienes implementación completa por código

Tu sitio ya tiene **todos los eventos programados manualmente** en `analytics.js`, que es:
- ✅ Más potente y flexible
- ✅ Más confiable (no depende de selectores CSS que pueden cambiar)
- ✅ Incluye datos dinámicos (precios, IDs, cantidades)
- ✅ Compatible con conversiones avanzadas

## Eventos TikTok Ya Implementados

### 📊 Eventos actuales en tu código:

| Evento Ionik | Evento TikTok | Cuándo se dispara | Datos enviados |
|-------------|---------------|-------------------|----------------|
| `add_to_cart` | **AddToCart** | Usuario agrega producto al carrito | ID producto, nombre, precio, cantidad |
| `view_item` | **ViewContent** | Usuario ve detalle de producto | ID producto, nombre, precio |
| `begin_checkout` | **InitiateCheckout** | Usuario inicia checkout | Productos en carrito, valor total |
| `purchase` | **PlaceAnOrder** | Compra completada | Orden completa, productos, valor total |
| `generate_lead` | **Contact** | Usuario contacta (WhatsApp, etc.) | Método de contacto, ubicación |

### 📍 Ubicación del código:
`js/analytics.js` → líneas 357-420 (función `_fireTikTok`)

## Comparación: Event Builder vs Tu Código

### Event Builder (NO tienes, NO necesitas):
```
❌ Limitado a clics simples en botones
❌ No puede capturar datos dinámicos automáticamente
❌ Requiere reconfiguración si cambia el diseño
❌ Datos básicos sin contexto
```

### Tu Implementación por Código (✅ Ya tienes):
```javascript
// Ejemplo: AddToCart con datos completos
ttq.track('AddToCart', {
    contents: [{
        content_id:   '12345',              // ID real del producto
        content_name: 'Lámpara Qi',         // Nombre real del producto
        quantity:     1,                     // Cantidad agregada
        price:        33590                  // Precio real con descuentos
    }],
    value:    33590,                         // Valor total
    currency: 'CLP'                          // Moneda chilena
});
```

**Ventajas de tu código:**
- ✅ Envía datos **reales y dinámicos**
- ✅ Incluye precios actualizados con descuentos
- ✅ Funciona con productos cargados dinámicamente
- ✅ Más preciso para optimización de anuncios de TikTok

## Recomendación Final

### ✅ **Mantén tu implementación por código**

**Razones:**
1. Ya tienes **todos los eventos estándar** de TikTok implementados
2. Tu código envía **datos más ricos** (IDs, precios, cantidades)
3. Es más **mantenible** a largo plazo
4. Compatible con **Conversion API** futura de TikTok

### 🎯 Lo que SÍ debes hacer en TikTok Events Manager:

1. **Verificar que detecta el pixel** ✅
   - Ir a: Events Manager → Pixel → Overview
   - Debe mostrar: "Pixel detected on your website"

2. **Probar eventos en Test Mode** 🧪
   - Ir a: Events Manager → Pixel → Test Events
   - Generar eventos en tu sitio (agregar al carrito, etc.)
   - Verificar que aparezcan en tiempo real

3. **Configurar Web Events (opcional)** 🎯
   - Ir a: Events Manager → Pixel → Settings → Event match quality
   - Configurar parámetros adicionales si quieres (email, phone)

4. **No usar Event Builder** ❌
   - Ignorar completamente esta herramienta
   - Tu código es superior

## Cómo Verificar que Funciona

### Paso 1: Abrir Test Events
1. Ve a TikTok Ads Manager
2. Events Manager → tu pixel → "Test Events"

### Paso 2: Probar en tu sitio
```
✅ Agregar producto al carrito → Debe aparecer "AddToCart"
✅ Ver detalle de producto → Debe aparecer "ViewContent"
✅ Iniciar checkout → Debe aparecer "InitiateCheckout"
✅ Contactar WhatsApp → Debe aparecer "Contact"
```

### Paso 3: Verificar datos
Cada evento debe mostrar:
- ✅ `contents` con `content_id`, `content_name`, `price`, `quantity`
- ✅ `value` (valor total)
- ✅ `currency: 'CLP'`

## Próximos Pasos Opcionales (Futuro)

### 📈 Avanzado: TikTok Conversion API (Server-Side)
Si en el futuro quieres mayor precisión (bypass de ad blockers):
- Implementar Conversion API desde tu backend Node.js
- Enviar eventos también desde servidor
- **Pero no es necesario ahora** — tu implementación actual es suficiente

### 🔒 Enhanced Match (Opcional)
Para mejorar atribución de conversiones:
```javascript
// Agregar al código si tienes email/phone del usuario
ttq.identify({
    email: 'user@example.com',     // Email del usuario (hasheado)
    phone_number: '+56912345678'   // Teléfono (hasheado)
});
```

## Conclusión

**🎉 Tu implementación está CORRECTA y COMPLETA**

- ❌ NO necesitas Event Builder
- ✅ Tienes todos los eventos estándar programados
- ✅ Envías datos ricos y dinámicos
- ✅ Solo verifica que TikTok detecte el pixel base (ya agregado en HEAD)

**Solo asegúrate que el pixel sea detectado** (problema que acabamos de resolver), y estarás listo para optimizar campañas de TikTok Ads con conversiones reales.
