# Copilot Instructions — IonikHome

## Project Overview

IonikHome (brand: Ionik) is a B2C e-commerce site selling wireless charging devices and accessories to the Chilean market. Prices are in CLP (Chilean Pesos). All user-facing content, comments, and variable names are in Spanish.

---

## Architecture

### Static Frontend (current, fully functional)

No build process. Files are served as-is — no bundler, no transpiler, no package.json. Open `index.html` directly in a browser or via any static server.

```
index.html                  ← Single-page app entry point
css/
  style.css                 ← CSS custom properties, typography, layout
  components.css            ← UI components (product cards, cart, modals)
  responsive.css            ← Mobile/tablet media queries
js/
  main.js                   ← App init, navigation, global event listeners
  products.js               ← Product loading, filtering, DOM rendering
  cart.js                   ← Cart state, discounts, checkout flow
admin/
  upload-products.html      ← Separate admin page; CSV bulk product upload
```

The cart state lives in **`localStorage`** and syncs to the DOM on every change. There is no React/Vue/Angular — all rendering is manual DOM manipulation.

### Backend (planned, not yet wired up)

`oracle-connection.js` provides Node.js classes (`ProductsDB`, `ImagesDB`, `OrdersDB`) for Oracle Cloud Autonomous Database. The SQL schema is in `ESQUEMASQL/schema.sql`. The backend integration guide (Express + Oracle + payment gateways) lives in `integracionReadme/README.md`.

When the backend is implemented:
- Runtime: Node.js + Express
- DB: Oracle Cloud 19c+ (connection pool via `oracledb`)
- Auth: JWT for admin routes
- Payment: Transbank WebPay Plus (Chile) or Mercado Pago

---

## Key Conventions

### JavaScript

- **Vanilla ES6+** — no framework, no imports/exports (scripts loaded via `<script>` tags in order).
- Functions and variables use **camelCase**; classes use **PascalCase**.
- JS files are organized into sections separated by comment banners:
  ```js
  // ================================
  // SECTION NAME
  // ================================
  ```
- Async operations use `async/await` with `try/catch`.
- Inline `onclick="functionName()"` handlers are used for simple DOM actions.

### CSS

- All design tokens are **CSS custom properties** defined in `style.css`, named in Spanish:
  ```css
  --verde-limon      /* primary accent color */
  --acento-2         /* secondary accent */
  --gris-oscuro      /* dark gray text */
  --sombra           /* standard box-shadow */
  --transicion       /* all 0.3s ease */
  ```
  Always use these variables instead of raw values.
- Class naming is BEM-inspired: `.product-card`, `.product-image-slider`, `.btn-primary`.
- Breakpoints use `max-width` (mobile-first media queries): `1024px`, `768px`, `480px`.

### Database

- Run `ESQUEMASQL/schema.sql` against Oracle Cloud to bootstrap the schema.
- The schema includes triggers for auto-timestamping and rating calculation, and a stored procedure `SP_PROCESS_ORDER` for atomic order processing.
- Views `V_PRODUCTS_FULL`, `V_ORDERS_SUMMARY`, `V_TOP_SELLING_PRODUCTS` are pre-built for common queries.

### Environment Variables (for backend)

```bash
ORACLE_USER=ADMIN
ORACLE_PASSWORD=...
ORACLE_CONNECTION_STRING=...   # Full TCPs connection string
TNS_ADMIN=./wallet             # Path to Oracle Wallet
JWT_SECRET=...
PORT=3000
WEBPAY_COMMERCE_CODE=...
WEBPAY_API_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
FRONTEND_URL=https://ionik.com
```

**Never commit `.env` or the Oracle Wallet files.**

---

## Planned API Endpoints

When building the backend, follow the routes documented in `integracionReadme/README.md`:

```
GET/POST/PUT/DELETE  /api/products
POST                 /api/products/:id/images
GET/POST/PATCH       /api/orders
POST                 /api/payment/create-transaction   (Transbank)
POST                 /api/payment/create-preference    (Mercado Pago)
```

Admin-mutating routes must use the `authenticateAdmin` JWT middleware.

---

## Deployment

- **Frontend**: Static hosting (Netlify/Vercel) with API proxied to the backend URL. No build step needed.
- **Backend**: Node.js + PM2 on a VPS, with Nginx as reverse proxy.
- **DB**: Oracle Cloud Autonomous Database (Transaction Processing workload).
