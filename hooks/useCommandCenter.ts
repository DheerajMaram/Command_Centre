import { useState, useEffect, useCallback } from 'react'
import { getGoalTemplates, createGoalTemplate, updateGoalTemplate, archiveGoalTemplate } from '@/lib/data'
import { getDailyEntries, upsertDailyEntry, deleteDailyEntry, getEntriesByDateRange } from '@/lib/data'
import { getCommandStats } from '@/lib/data'
import type { GoalTemplate, DailyEntryWithGoal, CommandStats } from '@/types'

export function useCommandCenter(userId: string) {
  const [goals, setGoals] = useState<GoalTemplate[]>([])
  const [entries, setEntries] = useState<DailyEntryWithGoal[]>([])
  const [entriesByDate, setEntriesByDate] = useState<Record<string, { total: number; completed: number; pending: number }>>({})
  const [stats, setStats] = useState<CommandStats>({
    totalMinutes: 0,
    completedCount: 0,
    totalCount: 0,
    streak: 0,
    lastActivity: null,
  })
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const loadData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      
      // Calculate date range for calendar (current month)
      const date = new Date(currentDate)
      const year = date.getFullYear()
      const month = date.getMonth()
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const [goalsData, entriesData, statsData, entriesByDateData] = await Promise.all([
        getGoalTemplates(userId),
        getDailyEntries(userId, currentDate),
        getCommandStats(userId, currentDate),
        getEntriesByDateRange(userId, startDate, endDate),
      ])

      setGoals(goalsData)
      setEntries(entriesData)
      setStats(statsData)
      setEntriesByDate(entriesByDateData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, currentDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Optimistic goal creation
  const addGoal = useCallback(
    async (name: string, isPrimary: boolean = false) => {
      const tempId = `temp-${Date.now()}`
      const newGoal: GoalTemplate = {
        id: tempId,
        user_id: userId,
        name,
        is_active: true,
        is_primary: isPrimary,
        sort_order: goals.length,
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // If setting as primary, unset other primaries optimistically
      if (isPrimary) {
        setGoals((prev) => prev.map((g) => ({ ...g, is_primary: false })))
      }

      setGoals((prev) => [...prev, newGoal])

      try {
        const created = await createGoalTemplate(userId, name, goals.length, isPrimary)
        setGoals((prev) => prev.map((g) => (g.id === tempId ? created : g)))
        
        // Automatically create an entry for the current date so the task shows up immediately
        try {
          await upsertDailyEntry(userId, currentDate, created.id, {
            minutes_spent: 0,
            done: false,
            notes: null,
          })
        } catch (entryError) {
          console.error('Error creating initial entry:', entryError)
          // Continue even if entry creation fails
        }
        
        // Refresh calendar data when new goal is added
        await loadData()
      } catch (error) {
        console.error('Error creating goal:', error)
        setGoals((prev) => prev.filter((g) => g.id !== tempId))
        loadData() // Revert on error
      }
    },
    [userId, goals.length, currentDate, loadData]
  )

  // Optimistic goal update
  const updateGoal = useCallback(async (id: string, updates: Partial<GoalTemplate>) => {
    // If setting as primary, unset other primaries optimistically
    if (updates.is_primary === true) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : { ...g, is_primary: false }))
      )
    } else {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      )
    }

    try {
      const updated = await updateGoalTemplate(id, updates, userId)
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    } catch (error) {
      console.error('Error updating goal:', error)
      loadData() // Revert on error
    }
  }, [loadData, userId])

  // Optimistic goal archive
  const archiveGoal = useCallback(
    async (id: string) => {
      const goal = goals.find((g) => g.id === id)
      setGoals((prev) => prev.filter((g) => g.id !== id))

      try {
        await archiveGoalTemplate(id)
        // Refresh calendar data when goal is archived
        await loadData()
      } catch (error) {
        console.error('Error archiving goal:', error)
        if (goal) setGoals((prev) => [...prev, goal])
        loadData() // Revert on error
      }
    },
    [goals, loadData]
  )

  // Optimistic entry update
  const updateEntry = useCallback(
    async (
      goalTemplateId: string,
      updates: Partial<DailyEntryWithGoal>
    ) => {
      const existingEntry = entries.find(
        (e) => e.goal_template_id === goalTemplateId
      )

      if (existingEntry) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === existingEntry.id ? { ...e, ...updates } : e
          )
        )
      } else {
        const goal = goals.find((g) => g.id === goalTemplateId)
        if (!goal) return

        const tempEntry: DailyEntryWithGoal = {
          id: `temp-${Date.now()}`,
          user_id: userId,
          date: currentDate,
          goal_template_id: goalTemplateId,
          minutes_spent: updates.minutes_spent || 0,
          done: updates.done || false,
          notes: updates.notes || null,
          archived_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          goal_template: goal,
          ...updates,
        }
        setEntries((prev) => [...prev, tempEntry])
      }

      try {
        await upsertDailyEntry(userId, currentDate, goalTemplateId, updates)
        // Refresh all data including calendar entriesByDate
        await loadData()
      } catch (error) {
        console.error('Error updating entry:', error)
        loadData() // Revert on error
      }
    },
    [userId, currentDate, entries, goals, loadData]
  )

  // Optimistic entry delete
  const removeEntry = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id)
      setEntries((prev) => prev.filter((e) => e.id !== id))

      try {
        await deleteDailyEntry(id)
        await loadData() // Refresh stats
      } catch (error) {
        console.error('Error deleting entry:', error)
        if (entry) setEntries((prev) => [...prev, entry])
      }
    },
    [entries, loadData]
  )

  // Function to refresh calendar data for a specific month
  const refreshCalendarForMonth = useCallback(async (year: number, month: number) => {
    if (!userId) return
    
    const startDate = new Date(year, month, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
    
    try {
      const entriesByDateData = await getEntriesByDateRange(userId, startDate, endDate)
      setEntriesByDate((prev) => ({ ...prev, ...entriesByDateData }))
    } catch (error) {
      console.error('Error refreshing calendar:', error)
    }
  }, [userId])

  return {
    goals,
    entries,
    entriesByDate,
    stats,
    loading,
    currentDate,
    setCurrentDate,
    addGoal,
    updateGoal,
    archiveGoal,
    updateEntry,
    removeEntry,
    refresh: loadData,
    refreshCalendarForMonth,
  }
}
