'use client'

import { useState, useEffect } from 'react'
import type { GoalTemplate, DailyEntryWithGoal } from '@/types'
import SectionHeader from './ui/SectionHeader'
import GhostButton from './ui/GhostButton'

interface ActiveOperationsProps {
  goals: GoalTemplate[]
  entries: DailyEntryWithGoal[]
  loading: boolean
  currentDate: string
  onAddGoal: (name: string) => void
  onUpdateGoal: (id: string, updates: Partial<GoalTemplate>) => void
  onArchiveGoal: (id: string) => void
  onUpdateEntry: (
    goalTemplateId: string,
    updates: Partial<DailyEntryWithGoal>
  ) => void
  onRemoveEntry: (id: string) => void
  triggerAddTask?: boolean // New prop to trigger add task input
}

export default function ActiveOperations({
  goals,
  entries,
  loading,
  currentDate,
  onAddGoal,
  onUpdateGoal,
  onArchiveGoal,
  onUpdateEntry,
  onRemoveEntry,
  triggerAddTask,
}: ActiveOperationsProps) {
  const [newGoalName, setNewGoalName] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)

  // Show add input when triggered from calendar
  useEffect(() => {
    if (triggerAddTask) {
      setShowAddInput(true)
    }
  }, [triggerAddTask])
  const [undoAction, setUndoAction] = useState<{
    type: 'archive' | 'delete'
    goal?: GoalTemplate
    entry?: DailyEntryWithGoal
  } | null>(null)

  const handleAddGoal = () => {
    if (newGoalName.trim()) {
      onAddGoal(newGoalName.trim())
      setNewGoalName('')
    }
  }

  const handleArchiveGoal = (goal: GoalTemplate) => {
    onArchiveGoal(goal.id)
    setUndoAction({ type: 'archive', goal })
    setTimeout(() => setUndoAction(null), 5000)
    // If archiving focus goal, focus will auto-update via useMemo
  }

  const handleUndo = () => {
    if (!undoAction) return

    if (undoAction.type === 'archive' && undoAction.goal) {
      onUpdateGoal(undoAction.goal.id, {
        is_active: true,
        archived_at: null,
      })
    } else if (undoAction.type === 'delete' && undoAction.entry) {
      // Recreate entry
      onUpdateEntry(undoAction.entry.goal_template_id, {
        minutes_spent: undoAction.entry.minutes_spent,
        done: undoAction.entry.done,
        notes: undoAction.entry.notes,
      })
    }

    setUndoAction(null)
  }

  const handleDeleteEntry = (entry: DailyEntryWithGoal) => {
    onRemoveEntry(entry.id)
    setUndoAction({ type: 'delete', entry })
    setTimeout(() => setUndoAction(null), 5000)
  }

  if (loading) {
    return (
      <div>
        <SectionHeader label="Active Operations" />
        <div className="text-[var(--text-subtle)] text-sm">Loading operations...</div>
      </div>
    )
  }


  // Calculate tasks for the day - show tasks that have entries OR were created on this date
  // This makes tasks date-specific: if you add a task on Jan 13, it only shows on Jan 13
  // Also handles legacy tasks that were created before auto-entry creation
  const allTasksForDay = goals.filter((goal) => {
    // Show if entry exists for current date
    const entry = entries.find((e) => e.goal_template_id === goal.id)
    if (entry !== undefined) return true
    
    // Also show if goal was created on the current date (for legacy tasks)
    const goalCreatedDate = new Date(goal.created_at).toISOString().split('T')[0]
    return goalCreatedDate === currentDate
  })
  
  const completedTasks = allTasksForDay.filter((goal) => {
    const entry = entries.find((e) => e.goal_template_id === goal.id)
    return entry?.done === true
  })
  const incompleteTasks = allTasksForDay.filter((goal) => {
    const entry = entries.find((e) => e.goal_template_id === goal.id)
    return !entry || entry.done === false
  })
  const isDayComplete = allTasksForDay.length > 0 && completedTasks.length === allTasksForDay.length

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        label="Active Operations"
        action={
          <div className="flex items-center gap-2">
            {undoAction && (
              <GhostButton onClick={handleUndo} size="sm">
                Undo {undoAction.type === 'archive' ? 'archive' : 'delete'}
              </GhostButton>
            )}
            {!showAddInput ? (
              <GhostButton onClick={() => setShowAddInput(true)} size="sm">
                + Task
              </GhostButton>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddGoal()
                      setShowAddInput(false)
                    }
                    if (e.key === 'Escape') {
                      setShowAddInput(false)
                      setNewGoalName('')
                    }
                  }}
                  placeholder="Operation name..."
                  autoFocus
                  className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--border-hover)] text-sm w-48"
                  style={{ borderRadius: '4px' }}
                />
                <GhostButton 
                  onClick={() => {
                    handleAddGoal()
                    setShowAddInput(false)
                  }} 
                  size="sm"
                >
                  Add
                </GhostButton>
                <GhostButton 
                  onClick={() => {
                    setShowAddInput(false)
                    setNewGoalName('')
                  }} 
                  size="sm"
                >
                  Cancel
                </GhostButton>
              </div>
            )}
          </div>
        }
      />

      {/* Day Summary */}
      {allTasksForDay.length > 0 && (
        <div className="mb-6 text-center">
          <div className={`text-sm font-medium mb-1 ${isDayComplete ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
            {isDayComplete ? '✓ Day Complete' : `Day Incomplete (${completedTasks.length}/${allTasksForDay.length})`}
          </div>
          <div className="text-xs text-[var(--text-subtle)]">
            Total: {allTasksForDay.length} | Completed: {completedTasks.length} | Incomplete: {incompleteTasks.length}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Completed Tasks ({completedTasks.length})
          </div>
          <div className="space-y-2">
            {completedTasks.map((goal) => {
              const entry = entries.find((e) => e.goal_template_id === goal.id)
              return (
                <div
                  key={goal.id}
                  className="py-3 px-4 bg-[var(--panel)] border border-[var(--divider)]"
                  style={{ borderRadius: '6px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-[var(--text-muted)] line-through mb-1">
                        {goal.name}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-subtle)]">
                        <span>{entry?.minutes_spent || 0}m</span>
                        <span>Completed</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={(e) => onUpdateEntry(goal.id, { done: e.target.checked })}
                          className="w-4 h-4 border-[var(--border)] bg-[var(--panel)] text-[var(--accent)] focus:ring-0 focus:ring-offset-0"
                          style={{ borderRadius: '2px' }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          handleArchiveGoal(goal)
                        }}
                        className="text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors text-xs px-2 py-1"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Incomplete Tasks ({incompleteTasks.length})
          </div>
          <div className="space-y-2">
            {incompleteTasks.map((goal) => {
              const entry = entries.find((e) => e.goal_template_id === goal.id)
              const minutes = entry?.minutes_spent || 0
              const status = entry && entry.minutes_spent > 0 ? 'active' : 'idle'
              
              return (
                <div
                  key={goal.id}
                  className="py-3 px-4 bg-[var(--panel)] border border-[var(--divider)] hover:border-[var(--border-hover)] transition-colors"
                  style={{ borderRadius: '6px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-[var(--text)] mb-1">
                        {goal.name}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                        <span>{minutes}m</span>
                        <span className="capitalize">{status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry?.done || false}
                          onChange={(e) => onUpdateEntry(goal.id, { done: e.target.checked })}
                          className="w-4 h-4 border-[var(--border)] bg-[var(--panel)] text-[var(--accent)] focus:ring-0 focus:ring-offset-0"
                          style={{ borderRadius: '2px' }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          handleArchiveGoal(goal)
                        }}
                        className="text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors text-xs px-2 py-1"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No Tasks State */}
      {allTasksForDay.length === 0 && (
        <div className="text-center py-12 text-[var(--text-subtle)]">
          <div className="text-sm mb-2">No tasks for this day</div>
          <div className="text-xs">Click "+ Task" to add a task</div>
        </div>
      )}
    </div>
  )
}
