'use client'

import { useState, useEffect } from 'react'
import type { CommandStats } from '@/types'

interface GreetingProps {
  stats: CommandStats
  currentDate: string
  onDismiss: () => void
}

export default function Greeting({ stats, currentDate, onDismiss }: GreetingProps) {
  const [showGreeting, setShowGreeting] = useState(true)

  useEffect(() => {
    // Check if we've shown greeting today
    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem('lastGreetingDate')
    
    if (stored === today) {
      setShowGreeting(false)
    } else {
      setShowGreeting(true)
    }
  }, [])

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('lastGreetingDate', today)
    setShowGreeting(false)
    onDismiss()
  }

  if (!showGreeting) return null

  const now = new Date()
  const hour = now.getHours()
  const today = new Date().toISOString().split('T')[0]
  
  // Time-based greeting
  let timeGreeting = ''
  if (hour < 12) {
    timeGreeting = 'Good morning'
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon'
  } else {
    timeGreeting = 'Good evening'
  }

  // Calculate days missed based on last activity
  let daysMissed = 0
  let message = ''
  
  if (stats.lastActivity) {
    const lastActivityDate = new Date(stats.lastActivity)
    const todayDate = new Date(today)
    const lastActivityDateStr = lastActivityDate.toISOString().split('T')[0]
    
    // Only count as missed if last activity was not today
    if (lastActivityDateStr !== today) {
      const diffTime = todayDate.getTime() - lastActivityDate.getTime()
      daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }
  } else {
    // No activity ever recorded
    daysMissed = -1 // Special flag for first time
  }

  // Personalized message based on missed days
  if (daysMissed === -1) {
    message = "Welcome. Let's start your journey."
  } else if (daysMissed === 0) {
    message = "Let's make today count."
  } else if (daysMissed === 1) {
    message = "You missed yesterday. Time to get back on track."
  } else if (daysMissed === 2) {
    message = "Two days away. Let's rebuild that momentum."
  } else if (daysMissed <= 7) {
    message = `It's been ${daysMissed} days. Every day is a fresh start.`
  } else {
    message = `Welcome back after ${daysMissed} days. Today is a new beginning.`
  }

  // Streak message
  let streakMessage = ''
  if (stats.streak > 0) {
    streakMessage = `Your streak: ${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`
  } else {
    streakMessage = "Start your streak today."
  }

  return (
    <div className="mb-6 p-4 bg-[var(--panel)] border border-[var(--divider)] relative" style={{ borderRadius: '6px' }}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors text-xs"
      >
        ×
      </button>
      <div className="pr-6">
        <div className="text-lg font-light text-[var(--text)] mb-1">
          {timeGreeting}
        </div>
        <div className="text-sm text-[var(--text-muted)] mb-2">
          {message}
        </div>
        <div className="text-xs text-[var(--text-subtle)]">
          {streakMessage}
        </div>
      </div>
    </div>
  )
}
