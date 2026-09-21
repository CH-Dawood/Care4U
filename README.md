# Care4U Platform

The application now boots as a Next.js App Router storefront with Supabase SSR authentication and a Supabase migration under `supabase/migrations/`. The legacy Express/SQLite implementation remains available as migration tooling while the catalogue is moved to Supabase.

A Pakistan-focused ecommerce foundation with a server-side SQLite database, customer storefront, and admin dashboard.

## Run locally

1. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
2. Apply `supabase/migrations/202609210001_care4u.sql` to the authorized Supabase project.
3. Run `npm install`.
4. Run `npm run dev` or `npm run build && npm start`.
5. Open `http://localhost:3000`.

The first boot creates `data/care4u.db`, seeds the four supplied catalogue records, three initial brands, and the configured admin user.

## Current API surface

- `GET /api/products` public catalogue search/filter
- `POST /api/auth/login` admin login
- `POST /api/admin/products` create product
- `PATCH /api/admin/products/:id` update product
- `DELETE /api/admin/products/:id` archive product
- `GET /api/admin/orders` order management
- `PATCH /api/admin/orders/:id/status` status updates
- `POST /api/orders` server-side order creation
- `GET /api/admin/analytics` dashboard metrics

## Import the existing care4u.pk catalogue

The public WooCommerce Store API can be re-imported with:

```text
npm run import:care4u
```

This upserts the publicly listed products, categories, descriptions, prices, source image URLs, gallery URLs, tags, source links, and source stock status. It does not import private customers, orders, passwords, payment credentials, or admin data. Numeric inventory remains zero when the source does not publish a quantity, so products cannot be sold accidentally.

Prices, stock, product details, payment providers, real customer authentication, image storage, email, shipping rates, and payment gateways should be configured before accepting live orders. The application intentionally does not invent those business facts.
