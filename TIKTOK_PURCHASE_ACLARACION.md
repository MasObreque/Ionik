# TikTok: Aclaración sobre Evento "Purchase"

## Mi Error Inicial

❌ **Error cometido:** Cambié el evento de `Purchase` a `CompletePayment` asumiendo que era necesario.

✅ **Corrección:** TikTok está pidiendo específicamente el evento **"Purchase"**, no otro.

## Mensaje de TikTok

```
Missing events - Purchase
Critical
Affected event types: Purchase

One or more required funnel events for your business vertical are missing 
from this pixel setup. This may affect delivery optimization.
```

### ¿Qué significa esto?

TikTok está diciendo que **NO DETECTA** el evento "Purchase" en tu sitio, **NO** que esté mal implementado.

## Estado Actual del Código

### ✅ El evento SÍ está implementado correctamente:

**Ubicación 1: `js/analytics.js` líneas 398-413**
```javascript
'purchase': function () {
    var contents = (d.items || []).map(function(item) {
        return {
            content_id:   String(item.item_id),
            content_name: item.item_name,
            quantity:     item.quantity || 1,
            price:        item.price
        };
    });
    ttq.track('Purchase', {  // ← Evento correcto
        contents: contents,
        value:    d.value,
        currency: 'CLP'
    });
}
```

**Ubicación 2: `js/main.js` línea 546**
```javascript
// Tracking: Purchase centralizado
IonkAnalytics.trackEvent('purchase', {
    order_id: orderNumber,
    value:    total,
    items:    cart.map(function(item) {
        return {
            item_id:   item.id,
            item_name: item.name,
            price:     item.price,
            quantity:  item.quantity
        };
    })
});
```

**El código está correcto.** ✅

## ¿Por qué TikTok dice "Missing"?

### Razón 1: **No ha detectado compras reales** (más probable)
- TikTok necesita **ver el evento dispararse** en tu sitio
- Si no has hecho compras de prueba, no lo detecta
- Solución: Hacer compras de prueba

### Razón 2: **Pixel base no visible** (YA CORREGIDO ✅)
- Antes el pixel estaba cargando condicionalmente
- Agregamos el código base en HEAD → TikTok ahora puede detectarlo
- Necesita 24-48 horas para actualizar estado

### Razón 3: **Cache del navegador**
- El código actualizado no se ha cargado
- Solución: Forzar recarga con `?v=20260615b`

### Razón 4: **Propagación de cambios** 
- TikTok necesita tiempo para detectar eventos nuevos
- Puede tardar 24-48 horas

## Eventos Estándar de TikTok

Ambos eventos son válidos según documentación oficial:

| Evento | Uso | Recomendado para |
|--------|-----|------------------|
| **Purchase** | Evento estándar general | Cualquier tipo de compra ✅ |
| **CompletePayment** | Evento de pago completo | Checkout multi-paso |
| **PlaceAnOrder** | Evento custom | No recomendado ❌ |

**Tu sitio usa "Purchase"** que es el evento estándar correcto. ✅

## Funnel Completo Implementado

```javascript
ViewContent        (view_item)         ✅ Implementado
AddToCart          (add_to_cart)       ✅ Implementado
InitiateCheckout   (begin_checkout)    ✅ Implementado
Purchase           (purchase)          ✅ Implementado
Contact            (generate_lead)     ✅ Implementado
```

## Cómo Verificar que Funciona

### Prueba Manual:

1. **Abrir TikTok Events Manager**
   - Events Manager → tu pixel → **Test Events**

2. **Hacer compra de prueba en tu sitio:**
   - Agregar producto al carrito
   - Proceder al checkout
   - Completar compra
   - Confirmar en WhatsApp

3. **Verificar en Test Events:**
   - Debe aparecer evento: **"Purchase"**
   - Con datos:
     ```json
     {
       "contents": [
         {
           "content_id": "1",
           "content_name": "Lámpara Qi",
           "quantity": 1,
           "price": 33590
         }
       ],
       "value": 33590,
       "currency": "CLP"
     }
     ```

4. **Si aparece el evento → TODO ESTÁ CORRECTO** ✅

### Prueba en Consola del Navegador:

```javascript
// Abrir consola (F12)
// Verificar que ttq está cargado:
console.log(typeof ttq);  // debe mostrar: "object"

// Disparar evento de prueba:
ttq.track('Purchase', {
    contents: [{ content_id: '999', content_name: 'Test', quantity: 1, price: 1000 }],
    value: 1000,
    currency: 'CLP'
});

// Verificar en Test Events de TikTok que apareció
```

## Solución Final

### ✅ **El código está CORRECTO**

**NO hay que cambiar nada más.** El warning de TikTok desaparecerá cuando:

1. ✅ **Pixel base sea detectado** (ya agregado en HEAD)
2. ✅ **Se disparen compras reales** (hacer pruebas o esperar compras)
3. ✅ **Pasen 24-48 horas** para que TikTok actualice estado

### Pasos siguientes:

1. **Subir cambios al servidor** (pixel base en HEAD + evento Purchase)
2. **Hacer 2-3 compras de prueba** en tu sitio
3. **Verificar en Test Events** que aparecen
4. **Esperar 24-48 horas** → Warning desaparece automáticamente

## Conclusión

- ❌ No cambiar a CompletePayment (fue mi error)
- ✅ Mantener "Purchase" (lo que TikTok está pidiendo)
- ✅ El código está correcto
- ⏰ El warning desaparecerá automáticamente en 24-48 horas

**No requiere más cambios de código.** Solo necesita tiempo y algunas compras de prueba para que TikTok lo detecte activo.
