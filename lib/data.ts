import { supabase } from './supabase'
import type { GoalTemplate, DailyEntry, DailyEntryWithGoal, CommandStats } from '@/types'

// Goal Templates
export async function getGoalTemplates(userId: string): Promise<GoalTemplate[]> {
  const { data, error } = await supabase
    .from('goal_templates')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .eq('is_active', true)
    .order('is_primary', { ascending: false }) // Primary first
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map((goal: any) => ({
    ...goal,
    is_primary: goal.is_primary || false, // Default to false if null
  }))
}

export async function createGoalTemplate(
  userId: string,
  name: string,
  sortOrder: number,
  isPrimary: boolean = false
): Promise<GoalTemplate> {
  // If setting as primary, unset other primaries first
  if (isPrimary) {
    await supabase
      .from('goal_templates')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true)
  }

  const { data, error } = await supabase
    .from('goal_templates')
    .insert({
      user_id: userId,
      name,
      sort_order: sortOrder,
      is_active: true,
      is_primary: isPrimary,
    })
    .select()
    .single()

  if (error) throw error
  return { ...data, is_primary: data.is_primary || false }
}

export async function updateGoalTemplate(
  id: string,
  updates: Partial<GoalTemplate>,
  userId?: string
): Promise<GoalTemplate> {
  // If setting as primary, unset other primaries first
  if (updates.is_primary === true && userId) {
    await supabase
      .from('goal_templates')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true)
      .neq('id', id)
  }

  const { data, error } = await supabase
    .from('goal_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return { ...data, is_primary: data.is_primary || false }
}

export async function archiveGoalTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('goal_templates')
    .update({ archived_at: new Date().toISOString(), is_active: false })
    .eq('id', id)

  if (error) throw error
}

// Daily Entries
export async function getDailyEntries(
  userId: string,
  date: string
): Promise<DailyEntryWithGoal[]> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select(`
      *,
      goal_template:goal_templates(*)
    `)
    .eq('user_id', userId)
    .eq('date', date)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map((entry: any) => ({
    ...entry,
    goal_template: entry.goal_template,
  }))
}

export async function upsertDailyEntry(
  userId: string,
  date: string,
  goalTemplateId: string,
  updates: Partial<DailyEntry>
): Promise<DailyEntry> {
  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(
      {
        user_id: userId,
        date,
        goal_template_id: goalTemplateId,
        ...updates,
      },
      {
        onConflict: 'user_id,date,goal_template_id',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDailyEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_entries')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function getEntriesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, { total: number; completed: number; pending: number }>> {
  // Get all active goals (tasks) for the user with created_at date
  const { data: allGoals, error: goalsError } = await supabase
    .from('goal_templates')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('archived_at', null)

  if (goalsError) throw goalsError
  const allGoalIds = (allGoals || []).map(g => g.id)

  // Get entries for the date range, but only for active goals
  const { data: entriesData, error: entriesError } = await supabase
    .from('daily_entries')
    .select('date, goal_template_id, done')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .is('archived_at', null)
    .in('goal_template_id', allGoalIds) // Only entries for active goals

  if (entriesError) throw entriesError

  const counts: Record<string, { total: number; completed: number; pending: number }> = {}

  // Process all dates in the range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dateMap: Record<string, Set<string>> = {} // date -> set of goal IDs
  
  // Initialize all dates in range
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dateMap[dateStr] = new Set()
  }

  // Add goals that were created on each date (for legacy tasks)
  allGoals?.forEach((goal) => {
    const goalCreatedDate = new Date(goal.created_at).toISOString().split('T')[0]
    if (dateMap[goalCreatedDate]) {
      dateMap[goalCreatedDate].add(goal.id)
    }
  })

  // Add entries to the date map
  if (entriesData && entriesData.length > 0) {
    entriesData.forEach((entry) => {
      if (allGoalIds.includes(entry.goal_template_id) && dateMap[entry.date]) {
        dateMap[entry.date].add(entry.goal_template_id)
      }
    })
  }

  // Calculate counts for each date
  Object.keys(dateMap).forEach((dateStr) => {
    const goalIds = Array.from(dateMap[dateStr])
    if (goalIds.length > 0) {
      // Get entries for this date
      const dateEntries = entriesData?.filter(e => e.date === dateStr) || []
      const completed = dateEntries.filter((e) => e.done === true).length
      const pending = goalIds.length - completed
      
      counts[dateStr] = {
        total: goalIds.length,
        completed,
        pending,
      }
    }
  })

  return counts
}

// Stats
export async function getCommandStats(
  userId: string,
  date: string
): Promise<CommandStats> {
  // Get all active goals (tasks) for the user
  const { data: allGoals, error: goalsError } = await supabase
    .from('goal_templates')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('archived_at', null)

  if (goalsError) throw goalsError

  // Get today's entries
  const { data: todayEntries, error: todayError } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .is('archived_at', null)

  if (todayError) throw todayError

  const totalMinutes = (todayEntries || []).reduce(
    (sum, entry) => sum + (entry.minutes_spent || 0),
    0
  )
  
  // Count completed tasks (goals with entries where done = true)
  const completedCount = (allGoals || []).filter((goal) => {
    const entry = (todayEntries || []).find((e) => e.goal_template_id === goal.id)
    return entry?.done === true
  }).length
  
  // Total count = all active goals (tasks)
  const totalCount = (allGoals || []).length

  // Get last activity
  const { data: lastEntry, error: lastError } = await supabase
    .from('daily_entries')
    .select('updated_at')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (lastError && lastError.code !== 'PGRST116') throw lastError

  // Calculate streak (simplified - consecutive days with at least one entry)
  const { data: streakData, error: streakError } = await supabase
    .from('daily_entries')
    .select('date')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('date', { ascending: false })

  if (streakError) throw streakError

  // Calculate streak: consecutive days with entries up to and including the selected date
  // Only counts if the selected date itself has an entry
  let streak = 0
  if (streakData && streakData.length > 0) {
    const uniqueDates = [...new Set(streakData.map((e) => e.date))]
    const dateSet = new Set(uniqueDates)
    
    const selectedDateStr = date // Already in YYYY-MM-DD format
    
    // Only calculate streak if the selected date has an entry
    if (dateSet.has(selectedDateStr)) {
      const selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)
      
      // Start checking from the selected date and go backwards
      let checkDate = new Date(selectedDate)
      
      // Count consecutive days backwards from selected date
      while (true) {
        const checkDateStr = checkDate.toISOString().split('T')[0]
        if (dateSet.has(checkDateStr)) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1) // Go back one day
        } else {
          break // Streak broken
        }
      }
    }
    // If selected date has no entry, streak remains 0
  }

  return {
    totalMinutes,
    completedCount,
    totalCount,
    streak,
    lastActivity: lastEntry?.updated_at || null,
  }
}
