import { useState, type ReactNode } from 'react'

interface Props {
  title: string
  icon?: string
  defaultOpen?: boolean
  badge?: string
  children: ReactNode
}

export function ExpandableSection({ title, icon, defaultOpen = false, badge, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`expand-section ${open ? 'expand-section--open' : ''}`}>
      <button
        type="button"
        className="expand-section__trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="expand-section__left">
          {icon && <span className="expand-section__icon">{icon}</span>}
          <span>{title}</span>
          {badge && <span className="expand-section__badge">{badge}</span>}
        </span>
        <span className="expand-section__chev">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="expand-section__body">{children}</div>}
    </section>
  )
}
