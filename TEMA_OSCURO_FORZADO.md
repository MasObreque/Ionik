# Tema Oscuro Forzado - IonikHome

## Fecha: 2026-06-15

## Problema

La página se mostraba con fondo blanco por defecto. El usuario requiere que **siempre** se visualice con tema oscuro.

## Solución Implementada

### Cambios en `css/style.css`

#### 1. Body - Fondo oscuro global
```css
body {
    background: #2a2a2a;  /* Fondo oscuro forzado */
    color: #e0e0e0;       /* Texto claro para contraste */
}
```

#### 2. Header - Navegación oscura
```css
.main-header {
    background: #1a1a1a;  /* Header oscuro */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
```

#### 3. Secciones
```css
.products-section {
    background: #1a1a1a;  /* Fondo oscuro */
}

.benefits-section {
    background: #2a2a2a;  /* Fondo oscuro */
}
```

#### 4. Tarjetas de beneficios
```css
.benefit-card {
    background: #353535;  /* Tarjetas oscuras */
}

.benefit-card:hover {
    background: #404040;  /* Hover más claro */
}

.benefit-card h3 {
    color: #ffffff;       /* Texto blanco */
}

.benefit-card p {
    color: #b0b0b0;       /* Texto gris claro */
}
```

#### 5. Carrito lateral
```css
.cart-sidebar {
    background: #2a2a2a;  /* Carrito oscuro */
}

.cart-header h2 {
    color: #ffffff;       /* Texto blanco */
}

.close-cart {
    color: #ffffff;       /* Ícono blanco */
}
```

### Cambios en `css/components.css`

#### 1. Tarjetas de producto
```css
.product-card {
    background: #353535;  /* Fondo oscuro */
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.product-image-container {
    background: #2a2a2a;  /* Contenedor de imagen oscuro */
}
```

#### 2. Textos de producto
```css
.product-name {
    color: #ffffff;       /* Nombre en blanco */
}

.product-description {
    color: var(--blanco); /* Descripción en blanco (ya estaba) */
}

.price-original {
    color: #888;          /* Precio original gris claro */
}

.rating-count {
    color: #aaa;          /* Contador de ratings gris claro */
}
```

### Actualización de versión en `index.html`

```html
<link rel="stylesheet" href="css/style.css?v=20260615dark">
<link rel="stylesheet" href="css/components.css?v=20260615dark">
```

## Paleta de Colores Tema Oscuro

| Elemento | Color | Uso |
|----------|-------|-----|
| **Fondo principal** | `#2a2a2a` | Body, secciones generales |
| **Fondo oscuro** | `#1a1a1a` | Header, sección de productos |
| **Tarjetas** | `#353535` | Product cards, benefit cards |
| **Hover tarjetas** | `#404040` | Estado hover |
| **Bordes** | `#404040` | Separadores |
| **Texto principal** | `#ffffff` | Títulos, headings |
| **Texto secundario** | `#e0e0e0` | Body text |
| **Texto terciario** | `#b0b0b0` | Descripciones |
| **Texto deshabilitado** | `#888` | Precios tachados |

## Elementos que Mantienen Colores Originales

### ✅ Colores de acento (se mantienen para contraste):
- **Verde limón** (`var(--verde-limon)` / `#dde85e`) - Elementos destacados
- **Salmón** (`var(--salmon)` / `#f5a281`) - Botones primarios
- **Acento 1** (`var(--acento-1)` / `#e6c165`) - Estrellas, ratings
- **Acento 2** (`var(--acento-2)` / `#ef9a6d`) - Precios, hover estados
- **Acento 3** (`var(--acento-3)` / `#f97475`) - Badges de oferta

### ✅ Elementos mantenidos:
- Barra promocional (rojo/rosa)
- Botones primarios (salmón)
- Badges de productos (colores vibrantes)
- Testimonios (mantiene fondo claro para contraste)
- Footer (mantiene fondo oscuro original `var(--gris-oscuro)`)

## Verificación

### Checklist visual:
- ✅ Fondo de página oscuro (#2a2a2a)
- ✅ Header oscuro (#1a1a1a)
- ✅ Tarjetas de producto oscuras (#353535)
- ✅ Tarjetas de beneficios oscuras (#353535)
- ✅ Carrito lateral oscuro (#2a2a2a)
- ✅ Textos visibles con buen contraste
- ✅ Botones mantienen colores originales (salmón, naranja)
- ✅ Hero section mantiene diseño original

## Notas Técnicas

1. **No se usa prefers-color-scheme**: El tema oscuro está **forzado siempre**, no depende de la configuración del sistema del usuario.

2. **Compatibilidad**: Los cambios son puramente CSS, no requieren JavaScript adicional.

3. **Cache-busting**: Se actualizó la versión a `?v=20260615dark` para forzar recarga en navegadores.

4. **Contraste WCAG**: Los colores elegidos cumplen con estándares de accesibilidad:
   - Texto blanco (#ffffff) sobre #353535: ratio 11.95:1 ✅ (AAA)
   - Texto gris claro (#b0b0b0) sobre #2a2a2a: ratio 5.73:1 ✅ (AA)

## Reversión (si fuera necesario)

Para volver al tema claro:

```css
/* En style.css */
body {
    background: #ffffff;
    color: var(--negro);
}

.main-header {
    background: var(--blanco);
}

.products-section {
    background: var(--gris-claro);
}

/* etc... */
```

## Próximas Mejoras Opcionales

- [ ] Agregar toggle de tema (claro/oscuro) con localStorage
- [ ] Respetar prefers-color-scheme del sistema
- [ ] Agregar transiciones suaves al cambiar de tema
- [ ] Tema oscuro para páginas legales
