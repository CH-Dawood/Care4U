import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types/store'

export async function listProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*, brands(name), categories(name)').neq('status', 'archived').order('featured', { ascending: false }).order('created_at', { ascending: false })
  if (error) { console.error('products query failed', error); return [] }
  return (data ?? []).map((row: any) => ({ ...row, brand: row.brands?.name ?? null, category: row.categories?.name ?? null, featured: Boolean(row.featured), best_seller: Boolean(row.best_seller), new_arrival: Boolean(row.new_arrival) }))
}
