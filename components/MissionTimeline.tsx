'use client'

import { useState, useEffect } from 'react'
import type { CommandStats } from '@/types'
import SectionHeader from './ui/SectionHeader'
import Divider from './ui/Divider'
import GhostButton from './ui/GhostButton'
import StatLine from './ui/StatLine'
import Calendar from './Calendar'

interface MissionTimelineProps {
  currentDate: string
  setCurrentDate: (date: string) => void
  stats: CommandStats
  entriesByDate: Record<string, { total: number; completed: number; pending: number }>
  onAddTaskForDate: (date: string) => void
  onMonthChange?: (year: number, month: number) => void
}

export default function MissionTimeline({
  currentDate,
  setCurrentDate,
  stats,
  entriesByDate,
  onAddTaskForDate,
  onMonthChange,
}: MissionTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const today = new Date(currentDate)
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const timePercent = ((hours * 60 + minutes) / (24 * 60)) * 100

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div>
      <SectionHeader label="Mission Timeline" muted={true} />

      {/* Current Time */}
      <div className="mb-4">
        <div className="text-3xl font-mono font-light text-[var(--text)] mb-1">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs text-[var(--text-subtle)]">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Day Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--text-idle)]">00:00</span>
          <span className="font-mono text-[var(--accent)] font-medium">{formatTime(currentTime)}</span>
          <span className="text-[var(--text-idle)]">24:00</span>
        </div>
        <div className="h-1.5 bg-[var(--panel)] overflow-hidden relative" style={{ borderRadius: '2px' }}>
          {/* Past time - faded */}
          <div
            className="h-full bg-[var(--accent)] opacity-40 transition-all duration-1000"
            style={{ width: `${timePercent}%` }}
          />
          {/* Current time marker - distinct */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[var(--accent)] opacity-100 transition-all duration-1000"
            style={{ left: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* Day Navigation - Right under time, in one line */}
      <div className="flex gap-1 mb-6">
        <GhostButton
          onClick={() => {
            const prev = new Date(today)
            prev.setDate(prev.getDate() - 1)
            setCurrentDate(prev.toISOString().split('T')[0])
          }}
          className="flex-1 text-center"
          size="sm"
        >
          ← Previous
        </GhostButton>
        <GhostButton
          onClick={() => {
            const today = new Date()
            setCurrentDate(today.toISOString().split('T')[0])
          }}
          className="flex-1 text-center"
          size="sm"
        >
          Today
        </GhostButton>
        <GhostButton
          onClick={() => {
            const next = new Date(today)
            next.setDate(next.getDate() + 1)
            setCurrentDate(next.toISOString().split('T')[0])
          }}
          className="flex-1 text-center"
          size="sm"
        >
          Next →
        </GhostButton>
      </div>

      <Divider className="my-6" />

      {/* Progress Indicator */}
      {stats.totalCount > 0 && (
        <>
          <Divider className="my-6" />
          <StatLine
            label="Today's Progress"
            value={`${Math.round((stats.completedCount / stats.totalCount) * 100)}%`}
          />
        </>
      )}

      <Divider className="my-6" />

      {/* Calendar */}
      <div className="overflow-visible" style={{ zIndex: 1 }}>
        <Calendar
          currentDate={currentDate}
          onDateSelect={setCurrentDate}
          onAddTaskForDate={onAddTaskForDate}
          entriesByDate={entriesByDate}
          onMonthChange={onMonthChange}
        />
      </div>
    </div>
  )
}
