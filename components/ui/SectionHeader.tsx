interface SectionHeaderProps {
  label: string
  sublabel?: string
  action?: React.ReactNode
  muted?: boolean
}

export default function SectionHeader({ label, sublabel, action, muted = false }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div>
        <h2 className={`text-sm font-normal uppercase tracking-wider ${muted ? 'text-[var(--text-subtle)]' : 'text-[var(--text-muted)]'}`}>
          {label}
        </h2>
        {sublabel && (
          <p className="text-xs text-[var(--text-subtle)] mt-0.5">{sublabel}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
