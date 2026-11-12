import { pages } from '../../data'
import { Breadcrumbs } from '../../components/common/ui'

type Doc = { title: string; sections: { heading: string; body: string[] }[] }

export default function ContentPage({ page }: { page: string }) {
  const doc = (pages as unknown as Record<string, Doc>)[page]
  return (
    <div className="container-mb max-w-4xl pb-10">
      <Breadcrumbs items={[{ label: doc.title }]} />
      <article className="panel p-5 sm:p-8">
        <h1 className="border-b border-border pb-3 text-2xl font-bold sm:text-3xl">{doc.title}</h1>
        {doc.sections.map((s, i) => (
          <section key={i} className="mt-6">
            {s.heading && <h2 className="mb-2 border-b border-border pb-2 text-xl font-bold">{s.heading}</h2>}
            {s.body.map((b, j) => <p key={j} className="mb-3 text-[15px] leading-7 text-muted">{b}</p>)}
          </section>
        ))}
        {page === 'about' && <p className="mt-6 text-sm"><b>শুভেচ্ছান্তে</b><br /><b>mamunbooks.com Team</b></p>}
      </article>
    </div>
  )
}
