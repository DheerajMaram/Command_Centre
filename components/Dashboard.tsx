'use client'

import { useAuth } from '@/hooks/useAuth'
import { useCommandCenter } from '@/hooks/useCommandCenter'
import MissionTimeline from './MissionTimeline'
import ActiveOperations from './ActiveOperations'
import CommandStats from './CommandStats'
import GhostButton from './ui/GhostButton'
import Greeting from './Greeting'
import { signOut } from '@/lib/auth'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useAuth()
  const commandCenter = useCommandCenter(user?.id || '')
  const [showGreeting, setShowGreeting] = useState(true)
  const [triggerAddTask, setTriggerAddTask] = useState(false)

  if (!user) return null

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-[1920px] mx-auto px-12 py-8">
        {/* Header */}
        <div className="mb-10 flex justify-between items-baseline border-b border-[var(--divider)] pb-4">
          <div>
            <h1 className="text-2xl font-light text-[var(--text)] mb-0.5">
              Command Center
            </h1>
            <p className="text-xs text-[var(--text-subtle)]">
              {new Date(commandCenter.currentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <GhostButton onClick={signOut} size="sm">
            Sign Out
          </GhostButton>
        </div>

        {/* Greeting */}
        {showGreeting && !commandCenter.loading && (
          <Greeting
            stats={commandCenter.stats}
            currentDate={commandCenter.currentDate}
            onDismiss={() => setShowGreeting(false)}
          />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Mission Timeline */}
          <div className="col-span-2 relative" style={{ zIndex: 10 }}>
            <MissionTimeline
              currentDate={commandCenter.currentDate}
              setCurrentDate={commandCenter.setCurrentDate}
              stats={commandCenter.stats}
              entriesByDate={commandCenter.entriesByDate}
              onAddTaskForDate={(date) => {
                commandCenter.setCurrentDate(date)
                // Trigger add task input to show
                setTriggerAddTask(true)
                // Reset trigger after a brief moment
                setTimeout(() => setTriggerAddTask(false), 100)
              }}
              onMonthChange={commandCenter.refreshCalendarForMonth}
            />
          </div>

          {/* Center: Active Operations - VISUAL FIELD DOMINANCE */}
          <div className="col-span-8" style={{ zIndex: 1 }}>
            <ActiveOperations
              goals={commandCenter.goals}
              entries={commandCenter.entries}
              loading={commandCenter.loading}
              currentDate={commandCenter.currentDate}
              onAddGoal={commandCenter.addGoal}
              onUpdateGoal={commandCenter.updateGoal}
              onArchiveGoal={commandCenter.archiveGoal}
              onUpdateEntry={commandCenter.updateEntry}
              onRemoveEntry={commandCenter.removeEntry}
              triggerAddTask={triggerAddTask}
            />
          </div>

          {/* Right: Command Stats */}
          <div className="col-span-2">
            <CommandStats stats={commandCenter.stats} />
          </div>
        </div>
      </div>
    </div>
  )
}
