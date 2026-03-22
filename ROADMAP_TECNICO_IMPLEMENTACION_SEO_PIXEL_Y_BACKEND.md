# Roadmap tecnico de implementacion: SEO, Pixel, analitica, backend y catalogo desde BD

## Objetivo del documento

Este documento baja el plan anterior a una **implementacion tecnica realista dentro de IonikHome**, ordenada por fases, empezando por:

1. cambios minimos en `index.html`;
2. creacion o vinculacion de cuentas de marketing y SEO;
3. instrumentacion de eventos;
4. evolucion del sitio estatico a frontend + backend;
5. productos servidos desde Oracle;
6. paginas indexables de categoria y producto.

La idea es que este archivo funcione como hoja de ruta ejecutable del proyecto.

---

## Estado actual del proyecto

### Frontend actual

- `index.html` contiene la landing principal y la home comercial.
- `js/main.js` inicializa la app y dispara `loadProducts()`.
- `js/products.js` renderiza productos en cliente usando `sampleProducts`.
- `js/cart.js` maneja carrito en `localStorage`.
- `admin/upload-products.html` ya sugiere un flujo administrativo de carga.

### Backend y datos ya presentes

- `oracle-connection.js` ya contiene clases `ProductsDB`, `ImagesDB` y `OrdersDB`.
- `ESQUEMASQL` contiene el esquema Oracle con tablas, triggers, vistas y procedimiento almacenado.
- `integracionReadme` contiene lineamientos de integracion y despliegue.

### Limitaciones actuales

- No hay `meta description`, `canonical`, Open Graph, Twitter Cards ni JSON-LD en `index.html`.
- No hay `robots.txt` ni `sitemap.xml`.
- No hay GTM, GA4 ni Pixel instalados.
- No existen URLs de producto ni categoria.
- Los productos no salen del backend ni de Oracle; hoy se dibujan desde datos locales en `js/products.js`.
- No hay paginas reales para privacidad, terminos ni cookies.

---

## Vision objetivo

Al terminar las fases principales, Ionik deberia tener:

- frontend publico con home, categorias, producto y checkout;
- backend Node.js + Express;
- productos, imagenes y ordenes persistidos en Oracle;
- URLs indexables por categoria y producto;
- SEO tecnico completo;
- eventos de marketing confiables;
- pagina de compra confirmada para medir conversiones reales;
- autenticacion segura para administracion y APIs protegidas;
- mitigaciones activas contra SQL Injection, XSS, CSRF, abuso de APIs y errores de configuracion;
- codigo mantenible siguiendo principios de codigo limpio y separacion de responsabilidades;
- base lista para escalar a campañas, remarketing y SEO transaccional.

---

## Principios transversales obligatorios

Todo el roadmap debe ejecutarse con enfoque de **seguridad por diseño**, **codigo limpio** y **operacion segura**.

### Auditoria de arquitectura obligatoria antes de cualquier cambio

Antes de comenzar cualquier implementacion, refactor, integracion o despliegue, se debe realizar una **Auditoria de Arquitectura de Software**.

Esta auditoria no es opcional y debe revisar como minimo:

- estado actual de frontend, backend y base de datos;
- dependencias entre modulos y puntos de acoplamiento;
- riesgos de seguridad, mantenibilidad y escalabilidad;
- impacto del cambio en SEO, tracking, datos, pagos y operacion;
- compatibilidad con el roadmap y con las decisiones arquitectonicas vigentes;
- necesidad de crear, ajustar o eliminar componentes, rutas, tablas o flujos.

### Salidas minimas de la auditoria

Cada auditoria previa debe dejar claro:

- que problema se va a resolver;
- que componentes se veran afectados;
- que riesgos introduce el cambio;
- que controles de seguridad aplican;
- como se validara el resultado;
- si el cambio respeta o modifica la arquitectura objetivo.

### Seguridad por diseño

El proyecto debe alinearse como minimo con buenas practicas basadas en:

- **OWASP Top 10**
- **OWASP ASVS** como referencia de controles
- principio de minimo privilegio
- defensa en profundidad
- validacion explicita de entradas
- escape y codificacion segura de salidas
- gestion segura de secretos

### Buenas practicas obligatorias para todo cambio

1. **No concatenar SQL manualmente**
   - usar binds y consultas parametrizadas;
   - evitar cualquier patron que habilite SQL Injection.

2. **Validar y sanear toda entrada**
   - query params;
   - body JSON;
   - formularios;
   - parametros de ruta;
   - archivos subidos.

3. **Prevenir XSS**
   - no inyectar HTML arbitrario;
   - preferir `textContent` cuando aplique;
   - sanitizar contenido si alguna vez se permite HTML;
   - aplicar Content Security Policy cuando se despliegue.

4. **Proteger autenticacion y autorizacion**
   - JWT para rutas admin;
   - expiracion corta para access tokens;
   - validacion de firma y claims;
   - middleware de autorizacion por rol.

5. **Endurecer la API**
   - `helmet` o equivalente;
   - CORS restrictivo;
   - rate limiting;
   - payload size limits;
   - manejo explicito de errores.

6. **No exponer secretos**
   - usar `.env`;
   - publicar `.env.example`;
   - nunca commitear wallet, claves ni tokens.

7. **Registrar y monitorear eventos relevantes**
   - errores de autenticacion;
   - fallos de pago;
   - errores de validacion;
   - intentos de acceso indebido.

8. **Mantener codigo limpio**
   - funciones pequenas;
   - nombres claros;
   - separacion por capas;
   - no duplicar logica;
   - comentarios solo cuando aporten contexto.

9. **Aplicar pruebas y revisiones**
   - pruebas de rutas criticas;
   - pruebas de validacion;
   - revision de dependencias y configuracion antes de despliegue.

---

## Fase 0: Definiciones base y acceso a plataformas

### Objetivo

Dejar listo el acceso a cuentas, dominios, IDs y permisos antes de tocar codigo.

### Cuentas a crear o vincular

#### SEO y medicion

1. **Google Search Console**
   - Verificar dominio principal.
   - Verificar version con `https://`.
   - Usar verificacion por DNS si el dominio ya esta configurado.

2. **Google Analytics 4**
   - Crear propiedad de Ionik.
   - Crear flujo web para el dominio productivo.
   - Guardar `Measurement ID` tipo `G-XXXXXXXXXX`.

3. **Google Tag Manager**
   - Crear container web.
   - Guardar ID tipo `GTM-XXXXXXX`.

4. **Google Ads** (si haran pauta)
   - Vincular con GA4.
   - Vincular conversiones futuras.

5. **Meta Business Manager**
   - Crear o validar Business Manager.
   - Crear Pixel.
   - Guardar Pixel ID.
   - Verificar dominio en Meta.

6. **Meta Ads Account**
   - Vincular Pixel a la cuenta publicitaria.
   - Asignar permisos a marketing.

#### Comercio y catalogo

7. **Oracle Cloud**
   - Confirmar acceso a la instancia Autonomous Database.
   - Descargar Wallet.
   - Confirmar credenciales y cadena de conexion.

8. **Proveedor de hosting**
   - Definir donde ira el frontend.
   - Definir donde ira el backend.

9. **Pasarela de pago**
   - Transbank Webpay Plus o Mercado Pago.
   - Confirmar credenciales de sandbox y produccion.

### Entregables de esta fase

- dominio verificado en Google y Meta;
- IDs de GTM, GA4 y Pixel;
- acceso a Oracle;
- decision de hosting;
- acceso a pasarela de pago.

### Definiciones tecnicas de seguridad que deben cerrarse aqui

- estrategia de secretos y variables de entorno;
- duracion y renovacion de JWT;
- politica de roles admin;
- politica de CORS por dominio;
- encabezados de seguridad del frontend y backend;
- criterio de logging sin exponer datos sensibles.

### Datos sensibles que no deben ir al repo

- claves Oracle;
- Wallet Oracle;
- secretos JWT;
- claves de pasarela;
- credenciales de Meta o Google.

Todo esto debe ir en variables de entorno o en un vault seguro.

---

## Fase 1: Cambios minimos e inmediatos en `index.html`

### Objetivo

Mejorar la base tecnica del sitio sin cambiar todavia la arquitectura.

### Archivo principal a modificar

- `index.html`

### Cambios minimos recomendados en el `<head>`

1. Mejorar el `<title>`
   - Pasar de titulo generico a uno mas comercial y buscable.

2. Agregar:
   - `meta name="description"`
   - `meta name="robots"`
   - `link rel="canonical"`

3. Agregar Open Graph:
   - `og:title`
   - `og:description`
   - `og:image`
   - `og:url`
   - `og:type`
   - `og:locale`

4. Agregar Twitter Cards:
   - `twitter:card`
   - `twitter:title`
   - `twitter:description`
   - `twitter:image`

5. Agregar datos estructurados JSON-LD:
   - `Organization`
   - `WebSite`

6. Insertar snippet de Google Tag Manager:
   - script en `<head>`;
   - bloque `noscript` al inicio de `<body>`.

### Ajustes minimos de contenido SEO en el HTML

1. Revisar que solo exista un `h1` claro.
2. Asegurar `h2` coherentes por seccion.
3. Mejorar `alt` de imagenes principales.
4. Revisar textos del hero para incluir terminos comerciales mas buscables.

### Archivos adicionales a crear en esta fase

- `robots.txt`
- `sitemap.xml`
- `politica-privacidad.html`
- `terminos-condiciones.html`
- `politica-cookies.html`

### Controles de seguridad minimos desde la primera modificacion

Aunque esta fase sea de frontend, se recomienda considerar desde ya:

- `Content-Security-Policy` al desplegar;
- `Referrer-Policy`;
- `X-Content-Type-Options: nosniff`;
- `Permissions-Policy`;
- no insertar scripts de terceros fuera de GTM salvo necesidad real;
- inventario claro de tags de marketing.

### Objetivo real de esta fase

No busca aun posicionar miles de keywords. Busca:

- mejorar indexacion base;
- preparar el sitio para compartidos;
- dejarlo listo para GTM y Search Console;
- cubrir el minimo legal para medicion.

---

## Fase 2: Stack de tracking y consentimiento

### Objetivo

Instalar una base ordenada de analitica y publicidad sin duplicar scripts.

### Recomendacion tecnica

Usar **Google Tag Manager como capa central**.

### Orden recomendado

1. Instalar GTM en `index.html`.
2. Desde GTM configurar:
   - GA4 Configuration
   - Meta Pixel base
   - Google Ads si aplica

3. Crear una capa comun de eventos con `dataLayer`.

### Archivo nuevo recomendado

- `js\analytics.js`

### Responsabilidad de `js\analytics.js`

- inicializar un helper comun para marketing;
- exponer una funcion tipo `trackEvent(nombre, payload)`;
- empujar eventos a `window.dataLayer`;
- evitar que los eventos dependan de llamadas directas a cada plataforma.

### Eventos minimos a instrumentar

1. `page_view`
2. `view_item_list`
3. `view_item`
4. `add_to_cart`
5. `begin_checkout`
6. `purchase` (solo cuando exista confirmacion real)

### Archivos a modificar

- `index.html` para incluir `js/analytics.js`
- `js/main.js`
- `js/products.js`
- `js/cart.js`

### Puntos tecnicos concretos del proyecto actual

#### En `js/products.js`

- disparar `view_item_list` cuando se muestran productos;
- disparar `view_item` cuando exista una vista rapida o click real en producto;
- enviar `item_id`, `item_name`, `item_category`, `price`, `currency`.

#### En `js/cart.js`

- al ejecutar `addToCart(...)`, disparar `add_to_cart`;
- al ejecutar `proceedToCheckout()`, disparar `begin_checkout`;
- cuando exista compra confirmada, disparar `purchase`.

### Nota importante

Mientras no exista una pagina de confirmacion real, el evento `purchase` no debe dispararse en el click del boton. Debe dispararse despues de una confirmacion del backend o de la pasarela.

### Controles de seguridad para tracking

- no enviar datos personales innecesarios a herramientas de marketing;
- no filtrar correos, telefonos o direcciones en eventos;
- revisar consentimiento antes de disparar tags publicitarios si esa politica se implementa;
- centralizar eventos para evitar scripts duplicados o inseguros.

---

## Fase 3: Legal, consentimiento y configuracion comercial

### Objetivo

Evitar una implementacion incompleta desde el punto de vista legal y operativo.

### Archivos/paginas a crear

- `politica-privacidad.html`
- `terminos-condiciones.html`
- `politica-cookies.html`
- `devoluciones.html`
- `garantia.html`

### Cambios en `index.html`

- reemplazar `showUnderConstruction(event)` por enlaces reales;
- agregar banner o modulo de consentimiento de cookies;
- enlazar estas paginas desde el footer.

### Si quieren hacer publicidad seria

Conviene definir:

- politica de tratamiento de datos;
- uso de cookies de marketing;
- consentimiento para remarketing;
- base de eventos y audiencias.

---

## Fase 4: Preparar el proyecto para backend real

### Objetivo

Pasar de landing estatica con JS local a aplicacion con frontend servido y API real.

### Criterios de arquitectura segura

La implementacion del backend debe seguir:

- separacion por capas (`routes`, `controllers`, `services`, `data`);
- validacion de entrada antes de tocar servicios o BD;
- ningun acceso directo a BD desde rutas sin capa intermedia;
- errores normalizados sin filtrar stack traces al cliente;
- configuracion por entorno.

### Decision de arquitectura recomendada

Dado el estado del repo, la evolucion mas natural es:

- **Frontend estatico** servido como archivos publicos;
- **Backend Express** en Node.js;
- **Oracle** como fuente de productos, imagenes y ordenes.

### Estructura recomendada

```text
IonikHome/
  index.html
  categoria.html
  producto.html
  politica-privacidad.html
  terminos-condiciones.html
  robots.txt
  sitemap.xml
  css/
  js/
    main.js
    products.js
    cart.js
    analytics.js
    product-detail.js
    category.js
  backend/
    server.js
    app.js
    routes/
      products.js
      orders.js
      payments.js
      categories.js
    controllers/
    services/
    middleware/
      auth.js
      validation.js
    lib/
      oracle.js
    .env.example
  oracle-connection.js
```

### Archivos tecnicos nuevos recomendados

- `backend/server.js`
- `backend/app.js`
- `backend/routes/products.js`
- `backend/routes/orders.js`
- `backend/routes/payments.js`
- `backend/routes/categories.js`
- `backend/middleware/auth.js`
- `backend/middleware/validation.js`
- `backend/middleware/rate-limit.js`
- `backend/middleware/security-headers.js`
- `backend/.env.example`
- `package.json`

### Cambios estructurales importantes

1. El frontend deja de depender de `sampleProducts`.
2. El backend expone `/api/products`, `/api/products/:id`, `/api/categories`, `/api/orders`.
3. El frontend consulta datos reales con `fetch`.
4. `oracle-connection.js` se reutiliza o se encapsula en `backend/lib/oracle.js`.

### Requisitos de API segura

1. **JWT para administracion**
   - proteger rutas de escritura;
   - validar bearer token;
   - verificar expiracion;
   - distinguir autenticacion y autorizacion.

2. **Validacion estricta**
   - validar tipos, rangos, strings y enums;
   - rechazar payloads invalidos con `400`.

3. **Proteccion OWASP**
   - rate limiting;
   - CORS restrictivo;
   - proteccion de cabeceras;
   - manejo seguro de errores;
   - evitar mass assignment.

4. **Buenas practicas de codigo**
   - controladores delgados;
   - servicios con logica de negocio;
   - acceso a datos encapsulado;
   - sin funciones gigantes ni logica mezclada.

---

## Fase 5: Conectar productos reales desde Oracle

### Objetivo

Reemplazar el catalogo local por datos provenientes de BD.

### Archivos del repo que ya ayudan

- `oracle-connection.js`
- `ESQUEMASQL`

### Trabajo tecnico

1. Ejecutar el esquema Oracle.
2. Cargar categorias y productos reales.
3. Confirmar imagenes en `PRODUCT_IMAGES`.
4. Exponer endpoints de lectura.

### Controles obligatorios de acceso a datos

- usar siempre binds de Oracle en consultas y updates;
- no construir SQL con interpolacion de strings;
- limitar campos permitidos en updates;
- validar IDs y slugs antes de consultar;
- registrar errores de BD sin devolver detalles internos al cliente.

### Endpoints minimos recomendados

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`
- `GET /api/categories/:slug/products`

### Ajustes frontend

#### En `js/products.js`

Reemplazar:

- `const products = sampleProducts;`

por una llamada real:

- `fetch('/api/products')`

#### Recomendacion

Mantener temporalmente `sampleProducts` solo como fallback de desarrollo local si se decide, pero en produccion la fuente debe ser Oracle.

### Validaciones minimas del backend

- sanitizacion de entrada;
- manejo de errores HTTP;
- validacion de categoria;
- respuesta consistente en JSON.

### Recomendaciones adicionales de seguridad

- paginacion y limites para evitar abuso de consultas;
- timeouts y manejo de pool Oracle;
- no exponer columnas internas innecesarias;
- filtrar productos inactivos desde el backend.

---

## Fase 6: Crear paginas reales de categoria y producto

### Objetivo

Salir del modelo de home unica y abrir superficie SEO indexable.

### Nuevas paginas recomendadas

- `categoria.html`
- `producto.html`

### Estrategia de URLs recomendada

Si el hosting es simple y estatico:

- `categoria.html?slug=cargadores`
- `producto.html?slug=cargador-3-en-1-escritorio`

Si luego pasan a Nginx o SSR:

- `/categoria/cargadores`
- `/producto/cargador-3-en-1-escritorio`

### Mejor enfoque para SEO a mediano plazo

Moverse a URLs limpias reales:

- `/categoria/cargadores`
- `/categoria/lamparas`
- `/producto/cargador-inalambrico-3-en-1-escritorio`

### Archivos JS nuevos

- `js/category.js`
- `js/product-detail.js`

### Responsabilidades

#### `js/category.js`

- leer slug desde URL;
- consultar categoria y productos;
- renderizar listado;
- actualizar `title`, `meta description`, canonical y JSON-LD si el entorno lo permite.

#### `js/product-detail.js`

- leer slug o ID desde URL;
- consultar `GET /api/products/:id` o por slug;
- renderizar nombre, precio, stock, galeria, descripcion y CTA;
- preparar eventos `view_item`, `add_to_cart`;
- renderizar datos estructurados `Product`.

### Ajustes de base de datos recomendados

Hoy el esquema tiene `ID`, `NAME`, `DESCRIPTION`, etc. Para SEO escalable conviene agregar:

- `SLUG` en `PRODUCTS`
- `SHORT_DESCRIPTION`
- `META_TITLE`
- `META_DESCRIPTION`
- `ACTIVE`

Y en `CATEGORIES`:

- `SLUG`
- `META_TITLE`
- `META_DESCRIPTION`

Esto evita construir SEO solo con transformaciones improvisadas desde el nombre.

### Controles de seguridad para paginas publicas

- las paginas deben consumir solo datos ya validados por API;
- no renderizar HTML arbitrario desde la BD;
- escapar contenido dinamico si se inserta en el DOM;
- validar slugs y responder `404` cuando no existan.

---

## Fase 7: SEO tecnico ya orientado a producto y categoria

### Objetivo

Tener SEO correcto por pagina, no solo en la home.

### En paginas de producto

Agregar o generar:

- `title` unico;
- `meta description`;
- `canonical`;
- Open Graph;
- JSON-LD `Product`;
- disponibilidad;
- precio;
- moneda `CLP`;
- imagen principal;
- breadcrumbs si aplica.

### En paginas de categoria

Agregar o generar:

- `title` unico;
- `meta description`;
- canonical;
- descripcion de categoria;
- listado indexable;
- JSON-LD `CollectionPage` o `ItemList`.

### Resultado real esperado

Aqui es donde Ionik empieza a poder competir mejor por busquedas transaccionales.

---

## Fase 8: Ordenes, checkout y medicion de conversion real

### Objetivo

Cerrar correctamente el embudo comercial.

### Backend

Implementar:

- `POST /api/orders`
- `POST /api/payment/create-transaction`
- `POST /api/payment/confirm-transaction`

o el flujo equivalente si usan Mercado Pago.

### Frontend

Crear paginas:

- `checkout.html`
- `gracias.html` o `orden-confirmada.html`

### Evento clave

El evento `purchase` debe dispararse desde:

- la pagina de gracias;
- o la confirmacion backend tras validar la orden;
- nunca solo desde el boton de pagar.

### Datos del evento `purchase`

- `transaction_id`
- `value`
- `currency`
- `items`
- `coupon` si aplica
- `shipping`
- `discount`

### Mejora futura recomendada

Agregar **Meta Conversions API** o tracking server-side cuando el backend ya este estable.

### Controles criticos de seguridad en checkout

- validar montos del lado servidor y no confiar en el frontend;
- recalcular total con precios desde BD;
- validar stock antes de confirmar orden;
- registrar estado de pago y transaccion de forma atomica;
- usar webhooks firmados o validacion de respuesta del proveedor;
- proteger checkout contra abuso automatizado y replay basico.

---

## Fase 9: Admin y operacion de catalogo

### Objetivo

Hacer sostenible la gestion diaria del catalogo.

### Base actual reutilizable

- `admin/upload-products.html`

### Evolucion recomendada

1. Autenticacion admin con JWT.
2. Carga de productos a Oracle desde panel protegido.
3. Carga de imagenes y orden.
4. Edicion de:
   - precio;
   - stock;
   - categoria;
   - slug;
   - meta title;
   - meta description;
   - estado activo/inactivo.

### Requisitos de seguridad del panel admin

- login seguro con credenciales fuertes;
- hash de password con algoritmo robusto;
- expiracion y renovacion controlada de sesiones JWT;
- auditoria de cambios criticos;
- restriccion por rol para operaciones destructivas;
- validacion de archivos e imagenes antes de subir.

### Endpoints admin sugeridos

- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/products/:id/images`
- `PATCH /api/products/:id/stock`

---

## Fase 10: Despliegue y publicacion

### Objetivo

Publicar sin romper SEO, tracking ni API.

### Frontend

Opciones:

- Netlify / Vercel para frontend estatico;
- o Nginx sirviendo archivos publicos.

### Backend

- Node.js + PM2
- Nginx como reverse proxy
- HTTPS obligatorio

### Hardening de despliegue

- variables de entorno separadas por ambiente;
- TLS valido y redireccion a HTTPS;
- logs rotados;
- backups de BD;
- actualizacion de dependencias;
- restriccion de acceso a rutas admin y API interna cuando aplique.

### Post-lanzamiento

1. Subir `robots.txt` y `sitemap.xml`.
2. Enviar sitemap a Search Console.
3. Validar eventos con:
   - Tag Assistant
   - GA4 DebugView
   - Meta Pixel Helper
4. Probar flujo real:
   - home;
   - vista producto;
   - add to cart;
   - checkout;
   - compra confirmada.

---

## Orden de ejecucion recomendado

### Regla inicial obligatoria

0. Realizar **Auditoria de Arquitectura de Software** antes de tocar codigo o configuracion.

### Etapa A: impacto rapido

1. Crear cuentas y vinculaciones.
2. Modificar `index.html` con SEO tecnico minimo.
3. Crear `robots.txt`, `sitemap.xml` y paginas legales.
4. Instalar GTM y GA4.
5. Instrumentar `add_to_cart` y `begin_checkout`.

### Etapa B: base comercial real

6. Crear backend Express.
7. Conectar Oracle.
8. Exponer `/api/products` y `/api/categories`.
9. Reemplazar `sampleProducts` por fetch al backend.

### Etapa C: crecimiento organico

10. Crear `categoria.html` y `producto.html`.
11. Agregar slugs y metadatos SEO en BD.
12. Agregar schema `Product` y `ItemList`.
13. Crear sitemap con URLs de categorias y productos.

### Etapa D: conversion y optimizacion

14. Integrar checkout real.
15. Confirmar compras desde backend.
16. Disparar `purchase`.
17. Vincular Google Ads y optimizar audiencias en Meta.

---

## Backlog tecnico sugerido por archivo

## `index.html`

- mejorar `title`;
- agregar `meta description`;
- agregar `canonical`;
- agregar Open Graph y Twitter Cards;
- insertar GTM;
- enlazar paginas legales reales;
- revisar headings y `alt`.

## `js/main.js`

- mantener inicializacion;
- preparar hook de `page_view` y navegacion interna si se decide medir scroll o CTA.

## `js/products.js`

- reemplazar fuente local por API;
- agregar tracking de lista y vista;
- preparar links a categoria y producto.

## `js/cart.js`

- disparar `add_to_cart`;
- disparar `begin_checkout`;
- luego `purchase` desde confirmacion real.

## `backend/app.js`

- configurar middlewares de seguridad;
- `helmet`;
- CORS;
- rate limiting;
- parseo con limites;
- manejo centralizado de errores.

## `backend/middleware/auth.js`

- validar JWT;
- verificar expiracion;
- resolver roles/permisos;
- rechazar tokens invalidos con respuestas consistentes.

## `backend/middleware/validation.js`

- validar payloads por ruta;
- whitelisting de campos aceptados;
- rechazar entradas malformadas.

## `oracle-connection.js`

- reutilizar logica existente;
- evaluar moverla a `backend/lib/oracle.js`;
- agregar soporte a slug y metadatos SEO.

## `admin/upload-products.html`

- convertirlo en panel conectado al backend protegido;
- agregar campos SEO y slug.

---

## Cambios de base de datos recomendados antes del SEO escalable

### Tabla `PRODUCTS`

Agregar columnas:

- `SLUG`
- `SHORT_DESCRIPTION`
- `META_TITLE`
- `META_DESCRIPTION`
- `ACTIVE`

### Tabla `CATEGORIES`

Agregar columnas:

- `SLUG`
- `META_TITLE`
- `META_DESCRIPTION`

### Beneficio

Permite que cada pagina publique contenido SEO propio sin depender de textos generados al vuelo.

---

## Riesgos si se salta el orden

### Si instalan Pixel sin estrategia

- eventos duplicados;
- datos pobres;
- campañas optimizando mal.

### Si montan backend sin plan de rutas

- home nueva pero sin SEO escalable;
- deuda tecnica entre frontend y API;
- URLs inconsistentes.

### Si no se incorpora seguridad desde el inicio

- riesgo de SQL Injection por consultas improvisadas;
- riesgo de XSS por renderizado inseguro;
- abuso de endpoints por falta de rate limiting;
- fugas de secretos;
- panel admin expuesto o con autorizacion debil.

### Si intentan SEO fuerte sin paginas reales

- mejora tecnica, pero poco crecimiento organico;
- baja capacidad de posicionar productos individuales.

---

## Resultado final esperado

Si se ejecuta este roadmap, Ionik pasa de:

- una landing estatica con productos en JavaScript

a:

- un e-commerce con medicion profesional,
- backend real,
- productos desde Oracle,
- paginas indexables,
- estructura apta para publicidad y SEO de crecimiento.

---

## Recomendacion practica de arranque

Si hay que empezar manana mismo, el mejor orden real es:

1. `index.html` con SEO tecnico minimo;
2. `robots.txt`, `sitemap.xml`, paginas legales;
3. GTM + GA4 + Meta Pixel;
4. `js/analytics.js`;
5. backend Express;
6. `/api/products`;
7. reemplazo de `sampleProducts`;
8. `producto.html` y `categoria.html`;
9. checkout real y `purchase`.

Ese orden da valor rapido, reduce retrabajo y deja al proyecto listo para vender y medir mejor.

---

## Checklist transversal de buenas practicas

Antes de considerar cada fase como terminada, validar:

- se realizo Auditoria de Arquitectura de Software antes de iniciar el cambio;
- seguridad alineada con OWASP para el alcance de la fase;
- consultas parametrizadas;
- validacion de entradas y salidas;
- rutas sensibles protegidas con JWT y roles;
- secretos fuera del repo;
- codigo con responsabilidad clara y sin duplicacion innecesaria;
- errores manejados de forma consistente;
- pruebas basicas de regresion y seguridad del flujo afectado.
