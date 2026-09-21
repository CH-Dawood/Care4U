import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const supabase = await createClient(); const { data: product } = await supabase.from('products').select('*, brands(name), categories(name)').eq('slug', slug).neq('status', 'archived').single(); if (!product) notFound()
  return <main className="mx-auto max-w-5xl px-6 py-12"><a href="/" className="text-sm text-[var(--care-green)]">← Back to Care4U</a><div className="mt-10 grid gap-10 md:grid-cols-2"><div className="aspect-square rounded-3xl bg-[var(--care-mint)]"/><div><p className="text-sm text-slate-500">{product.brands?.name}</p><h1 className="mt-2 text-4xl font-bold text-[var(--care-green)]">{product.name}</h1><p className="mt-5 leading-7 text-slate-600">{product.description || product.short_description}</p><p className="mt-8 text-2xl font-bold">PKR {product.sale_price ?? product.price ?? '—'}</p><button className="mt-8 rounded-full bg-[var(--care-green)] px-8 py-3 font-semibold text-white">Add to cart</button></div></div></main>
}
