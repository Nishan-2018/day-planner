'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { TaskModal } from './TaskModal'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  duration: number | null
  completed: boolean
  start_date: string
  end_date: string
}

interface CalendarClientProps {
  tasks: Task[] | null
}

export function CalendarClient({ tasks }: CalendarClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    setTaskToEdit(null)
    setIsModalOpen(true)
  }

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    setTaskToEdit(task)
    setIsModalOpen(true)
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
          <button onClick={prevMonth} className="p-2 rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition text-gray-600 dark:text-gray-300">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 md:px-4 py-1 text-sm font-medium rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition mx-1 text-gray-700 dark:text-gray-200">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition text-gray-600 dark:text-gray-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const startDate = startOfWeek(currentMonth)
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-xs md:text-sm text-gray-500 dark:text-gray-400 py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      )
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ''

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd')
        const cloneDay = day
        
        // Find tasks spanning this day
        const dayTasks = tasks?.filter(t => {
          const start = parseISO(t.start_date)
          const end = parseISO(t.end_date)
          start.setHours(0,0,0,0)
          end.setHours(23,59,59,999)
          const current = new Date(cloneDay)
          return current >= start && current <= end
        }) || []

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer group
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50 dark:bg-zinc-900/30 text-gray-400 dark:text-gray-600' : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100'}
              ${isSameDay(day, new Date()) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
              hover:bg-gray-50 dark:hover:bg-zinc-800/50
            `}
          >
            <div className="flex justify-between items-start">
              <span className={`text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''}
              `}>
                {formattedDate}
              </span>
              <PlusCircle size={16} className="text-gray-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
            </div>
            
            <div className="mt-1 md:mt-2 flex flex-col gap-1 overflow-y-auto max-h-[50px] md:max-h-[70px] no-scrollbar">
              {dayTasks.slice(0, 3).map((task, idx) => (
                <div 
                  key={`${task.id}-${idx}`}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 md:py-1 rounded truncate transition-opacity hover:opacity-80
                    ${task.completed ? 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400 line-through' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}
                  `}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-[9px] md:text-[10px] text-gray-500 font-medium px-1">
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
    return <div className="border-l border-t border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">{rows}</div>
  }

  return (
    <div className="max-w-6xl mx-auto mb-20 md:mb-0">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialDate={selectedDate}
        editTask={taskToEdit}
      />
    </div>
  )
}
