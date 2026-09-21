'use client'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() { const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget); const { error } = await createClient().auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) }); setBusy(false); if (error) setError(error.message); else window.location.href = '/account' }
  return <main className="mx-auto max-w-md px-6 py-20"><h1 className="text-3xl font-bold text-[var(--care-green)]">Sign in</h1><form onSubmit={submit} className="mt-8 space-y-4"><label className="block">Email<input name="email" type="email" required className="mt-1 w-full rounded-xl border p-3" /></label><label className="block">Password<input name="password" type="password" required className="mt-1 w-full rounded-xl border p-3" /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="w-full rounded-full bg-[var(--care-green)] p-3 font-semibold text-white">{busy ? 'Signing in…' : 'Sign in'}</button></form></main>
}
