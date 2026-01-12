export interface GoalTemplate {
  id: string
  user_id: string
  name: string
  is_active: boolean
  is_primary: boolean
  sort_order: number
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyEntry {
  id: string
  user_id: string
  date: string
  goal_template_id: string
  minutes_spent: number
  done: boolean
  notes: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyEntryWithGoal extends DailyEntry {
  goal_template: GoalTemplate
}

export interface CommandStats {
  totalMinutes: number
  completedCount: number
  totalCount: number
  streak: number
  lastActivity: string | null
}
