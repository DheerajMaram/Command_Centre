'use client'

import type { CommandStats as CommandStatsType } from '@/types'
import SectionHeader from './ui/SectionHeader'
import Divider from './ui/Divider'
import StatLine from './ui/StatLine'

interface CommandStatsProps {
  stats: CommandStatsType
}

export default function CommandStats({ stats }: CommandStatsProps) {
  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return 'Never'

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div>
      <SectionHeader label="Command Stats" muted={true} />

      <div className="space-y-5">
        {/* Total Minutes */}
        <StatLine label="Total Minutes" value={formatMinutes(stats.totalMinutes)} />

        <Divider />

        {/* Completion Rate */}
        <div>
          <div className="text-xs text-[var(--text-subtle)] mb-1">Completion</div>
          <div className="text-xl font-light text-[var(--text)]">
            {stats.totalCount > 0
              ? `${stats.completedCount} / ${stats.totalCount}`
              : '0 / 0'}
          </div>
          {stats.totalCount > 0 && (
            <div className="mt-2 h-0.5 bg-[var(--panel)] overflow-hidden" style={{ borderRadius: '1px' }}>
              <div
                className="h-full bg-[var(--accent)] transition-all"
                style={{
                  width: `${(stats.completedCount / stats.totalCount) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        <Divider />

        {/* Streak */}
        <StatLine
          label="Streak"
          value={`${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`}
        />

        <Divider />

        {/* Last Activity */}
        <StatLine label="Last Activity" value={formatLastActivity(stats.lastActivity)} />
      </div>
    </div>
  )
}
