'use client'

import { useState, useEffect } from 'react'
import GhostButton from './ui/GhostButton'

interface CalendarProps {
  currentDate: string
  onDateSelect: (date: string) => void
  onAddTaskForDate: (date: string) => void
  entriesByDate: Record<string, { total: number; completed: number; pending: number }> // date -> task counts
  onMonthChange?: (year: number, month: number) => void // Callback when viewing different month
}

export default function Calendar({
  currentDate,
  onDateSelect,
  onAddTaskForDate,
  entriesByDate,
  onMonthChange,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date(currentDate)
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  // Sync viewDate with currentDate when it changes
  useEffect(() => {
    const date = new Date(currentDate)
    const newViewDate = new Date(date.getFullYear(), date.getMonth(), 1)
    // Always update viewDate when currentDate changes to keep calendar in sync
    setViewDate(newViewDate)
    // Notify parent to refresh calendar data for the new month if needed
    if (onMonthChange) {
      onMonthChange(newViewDate.getFullYear(), newViewDate.getMonth())
    }
  }, [currentDate]) // Remove viewDate from dependencies to avoid infinite loop

  const today = new Date()
  // Parse currentDate as local date to avoid timezone issues
  const [selectedYear, selectedMonth, selectedDay] = currentDate.split('-').map(Number)
  const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay)

  const month = viewDate.getMonth()
  const year = viewDate.getFullYear()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Generate calendar days
  const days: (Date | null)[] = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    const dateStr = getDateString(date)
    return dateStr === currentDate // Compare directly with currentDate string (YYYY-MM-DD)
  }

  const getDateString = (date: Date | null) => {
    if (!date) return ''
    // Use local date to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDateTasks = (date: Date | null) => {
    if (!date) return null
    const dateStr = getDateString(date)
    return entriesByDate[dateStr] || null
  }

  const hasEntries = (date: Date | null) => {
    const tasks = getDateTasks(date)
    return tasks && tasks.total > 0
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    yearOptions.push(y)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value)
    const newViewDate = new Date(year, newMonth, 1)
    setViewDate(newViewDate)
    // Notify parent to refresh calendar data for this month
    if (onMonthChange) {
      onMonthChange(newViewDate.getFullYear(), newViewDate.getMonth())
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    const newViewDate = new Date(newYear, month, 1)
    setViewDate(newViewDate)
    // Notify parent to refresh calendar data for this month
    if (onMonthChange) {
      onMonthChange(newViewDate.getFullYear(), newViewDate.getMonth())
    }
  }

  const goToToday = () => {
    const today = new Date()
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    onDateSelect(today.toISOString().split('T')[0])
  }

  return (
    <div className="relative">
      {/* Calendar Header */}
      <div className="flex items-center gap-2 mb-4">
        {/* Month Dropdown */}
        <select
          value={month}
          onChange={handleMonthChange}
          className="flex-1 px-2 py-1 bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--border-hover)] cursor-pointer"
          style={{ borderRadius: '4px' }}
        >
          {monthNames.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>

        {/* Year Dropdown - Constrained to prevent overflow */}
        <div className="flex-1 relative" style={{ minWidth: '80px', maxWidth: '100px' }}>
          <select
            value={year}
            onChange={handleYearChange}
            className="w-full px-2 py-1 bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--border-hover)] cursor-pointer"
            style={{ borderRadius: '4px' }}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-xs text-[var(--text-subtle)] text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const dateStr = getDateString(date)
          const isTodayDate = isToday(date)
          const isSelectedDate = isSelected(date)
          const dateTasks = getDateTasks(date)

          return (
            <div
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`
                aspect-square relative p-1 cursor-pointer transition-colors flex flex-col items-center justify-center
                ${isSelectedDate 
                  ? 'bg-[var(--panel)] border-2 border-[var(--text)]' 
                  : 'hover:bg-[var(--panel)]'
                }
                ${isTodayDate && !isSelectedDate ? 'border border-[var(--text-muted)]' : ''}
              `}
              style={{ borderRadius: '4px' }}
            >
              <div className={`
                text-xs font-light relative z-10
                ${isSelectedDate 
                  ? 'text-[var(--text)] font-medium' 
                  : isTodayDate 
                    ? 'text-[var(--text)]' 
                    : 'text-[var(--text-muted)]'
                }
              `}>
                {date.getDate()}
              </div>
              {dateTasks && dateTasks.total > 0 && (
                <div className="absolute bottom-0.5 left-0 right-0 flex items-center justify-center gap-0.5">
                  {dateTasks.completed > 0 && (
                    <div className="w-1 h-1 bg-[var(--text-muted)] rounded-full" title={`${dateTasks.completed} completed`} />
                  )}
                  {dateTasks.pending > 0 && (
                    <div className="w-1 h-1 bg-[var(--accent)] rounded-full" title={`${dateTasks.pending} pending`} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tasks for Selected Day */}
      {(() => {
        const selectedDateStr = currentDate // Use currentDate directly (already in YYYY-MM-DD format)
        const selectedTasks = entriesByDate[selectedDateStr]
        const displayDate = (() => {
          const [year, month, day] = currentDate.split('-').map(Number)
          return new Date(year, month - 1, day)
        })()
        return (
          <div className="mt-4 pt-4 border-t border-[var(--divider)]">
            {selectedTasks && selectedTasks.total > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Tasks for {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[var(--text-subtle)]">Total: </span>
                      <span className="text-[var(--text)]">{selectedTasks.total}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-subtle)]">Completed: </span>
                      <span className="text-[var(--text-muted)]">{selectedTasks.completed}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-subtle)]">Pending: </span>
                      <span className="text-[var(--accent)]">{selectedTasks.pending}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--text-subtle)] mb-2">
                No tasks for {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
            <GhostButton
              onClick={() => onAddTaskForDate(currentDate)}
              size="sm"
              className="w-full text-center mt-3"
            >
              Add Task for {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </GhostButton>
          </div>
        )
      })()}
    </div>
  )
}
