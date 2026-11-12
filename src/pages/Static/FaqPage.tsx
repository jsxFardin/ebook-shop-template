import { useState } from 'react'
import { ChevronDown, Headset } from 'lucide-react'
import L from '../../components/common/L'
import { pages } from '../../data'

export default function FaqPage() {
  const { title, groups } = pages.faq
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="bg-page-alt pb-12">
      <div className="bg-surface py-10 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-xl px-4 text-sm text-muted">Find answers to common questions about ordering, delivery, returns, payments, and more.</p>
      </div>
      <div className="container-mb max-w-3xl">
        <div className="my-6 flex flex-wrap gap-2">
          {['All', ...groups.map((g) => g.name)].map((g) => (
            <button key={g} onClick={() => setFilter(g)} aria-pressed={filter === g} className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === g ? 'bg-accent text-gray-900' : 'bg-surface-2 hover:bg-border'}`}>{g}</button>
          ))}
        </div>
        <div className="space-y-5">
          {groups.filter((g) => filter === 'All' || g.name === filter).map((g) => (
            <section key={g.name} className="overflow-hidden rounded-lg border border-border bg-surface">
              <h2 className="bg-gradient-to-r from-accent to-[#ffb84d] px-4 py-3 text-lg font-bold text-gray-900">{g.name}</h2>
              <ul className="divide-y divide-border">
                {g.items.map((it) => {
                  const id = g.name + it.q
                  const isOpen = open === id
                  return (
                    <li key={id}>
                      <button onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-surface-2">
                        {it.q}<ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && <p className="anim-fade px-4 pb-4 text-sm leading-6 text-muted">{it.a}</p>}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-lg bg-gradient-to-r from-accent to-[#ffb84d] p-5 text-gray-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50"><Headset size={22} /></span>
          <div className="flex-1"><p className="font-bold">Still have questions?</p><p className="text-sm">Our support team is ready to help you</p></div>
          <L to="/contact" className="rounded bg-navy-3 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy">Contact Us</L>
        </div>
      </div>
    </div>
  )
}
