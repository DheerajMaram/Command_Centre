interface StatLineProps {
  label: string
  value: string | number | React.ReactNode
  subvalue?: string | React.ReactNode
}

export default function StatLine({ label, value, subvalue }: StatLineProps) {
  return (
    <div>
      <div className="text-xs text-[var(--text-subtle)] mb-1">{label}</div>
      <div className="text-xl font-light text-[var(--text)]">{value}</div>
      {subvalue && (
        <div className="text-xs text-[var(--text-muted)] mt-0.5">{subvalue}</div>
      )}
    </div>
  )
}
