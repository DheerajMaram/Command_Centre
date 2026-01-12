'use client'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-light text-[var(--text)] mb-4">404</h1>
        <p className="text-[var(--text-muted)] mb-6">Page not found</p>
        <a
          href="/"
          className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-hover)] transition-colors text-sm inline-block"
          style={{ borderRadius: '4px' }}
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
