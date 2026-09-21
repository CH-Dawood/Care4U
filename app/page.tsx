import Link from 'next/link'
import { listProducts } from '@/lib/queries/products'

export default async function HomePage() {
  const products = await listProducts()
  return <main>
    <header className="flex items-center justify-between bg-white px-6 py-5 shadow-sm"><Link href="/" className="text-2xl font-bold text-[var(--care-green)]">Care4U</Link><nav className="flex gap-5 text-sm"><Link href="/about">About</Link><Link href="/account">Account</Link><Link href="/checkout">Cart</Link></nav></header>
    <section className="bg-[var(--care-mint)] px-6 py-20 text-center"><p className="mb-3 uppercase tracking-[.25em] text-sm">Care for every day</p><h1 className="mx-auto max-w-3xl text-5xl font-bold text-[var(--care-green)]">Trusted wellness, delivered across Pakistan.</h1><p className="mx-auto mt-5 max-w-xl">Verified healthcare, skincare and personal care products from brands you can trust.</p></section>
    <section className="mx-auto max-w-6xl px-6 py-14"><div className="mb-7 flex items-end justify-between"><h2 className="text-3xl font-bold">Featured products</h2><Link href="/products" className="text-[var(--care-green)]">View all →</Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 8).map(product => <Link key={product.id} href={`/products/${product.slug}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"><div className="mb-4 aspect-square rounded-xl bg-[var(--care-mint)]"/><h3 className="font-semibold">{product.name}</h3><p className="mt-2 text-sm text-slate-500">{product.brand ?? 'Care4U'}</p>{product.price != null && <p className="mt-3 font-bold">PKR {product.sale_price ?? product.price}</p>}</Link>)}</div></section>
  </main>
}
