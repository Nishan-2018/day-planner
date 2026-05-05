'use client'

import { useState } from 'react'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO,
  isWithinInterval
} from 'date-fns'
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { TaskModal } from './TaskModal'

interface Task {
  id: string
  title: string
  start_date: string
  end_date: string
  completed: boolean
}

interface CalendarClientProps {
  tasks: Task[] | null
}

export function CalendarClient({ tasks }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    setIsModalOpen(true)
  }

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate
  let formattedDate = ""

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat)
      const cloneDay = day
      
      // Get tasks for this day (if the day falls between start_date and end_date)
      const dayTasks = tasks?.filter(t => {
        const start = parseISO(t.start_date)
        const end = parseISO(t.end_date)
        // Reset time to ensure correct comparison
        start.setHours(0,0,0,0)
        end.setHours(23,59,59,999)
        const current = new Date(cloneDay)
        return current >= start && current <= end
      }) || []

      days.push(
        <div
          key={day.toString()}
          onClick={() => handleDateClick(cloneDay)}
          className={`min-h-[100px] p-2 border border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer group ${
            !isSameMonth(day, monthStart)
              ? "bg-gray-50/50 dark:bg-zinc-900/50 text-gray-400"
              : isSameDay(day, new Date())
              ? "bg-blue-50/30 dark:bg-blue-900/10"
              : "bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${
              isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {formattedDate}
            </span>
            <PlusCircle size={16} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="mt-2 space-y-1">
            {dayTasks.slice(0, 3).map(task => (
              <div 
                key={task.id} 
                className={`text-xs truncate px-1.5 py-0.5 rounded ${
                  task.completed 
                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-500 line-through' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500 font-medium pl-1">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    )
    days = []
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium text-sm text-gray-600 dark:text-gray-300"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-zinc-800">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="flex flex-col bg-gray-100 dark:bg-zinc-800 gap-[1px]">
          {rows}
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialDate={selectedDate}
      />
    </>
  )
}
