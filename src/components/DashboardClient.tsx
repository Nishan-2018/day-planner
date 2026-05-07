'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, CheckCircle2, Circle, Clock, Trash2, MessageSquare, Send, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { TaskModal } from './TaskModal'
import { toggleTaskComplete, deleteTask, addTaskComment } from '@/app/actions/tasks'

interface Comment {
  id: string
  comment: string
  created_at: string
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  duration: number | null
  completed: boolean
  start_date: string
  end_date: string
  task_comments?: Comment[]
}

interface DashboardClientProps {
  tasks: Task[] | null
  currentDate: string
}

export function DashboardClient({ tasks, currentDate }: DashboardClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Optimistic UI State
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks || [])

  // Sync state when server props change
  useEffect(() => {
    setOptimisticTasks(tasks || [])
  }, [tasks])

  const handlePrevDay = () => {
    const prev = subDays(new Date(currentDate), 1)
    router.push(`/?date=${format(prev, 'yyyy-MM-dd')}`)
  }

  const handleNextDay = () => {
    const next = addDays(new Date(currentDate), 1)
    router.push(`/?date=${format(next, 'yyyy-MM-dd')}`)
  }

  const handleToday = () => {
    router.push('/')
  }

  const openEditModal = (task: Task) => {
    setTaskToEdit(task)
    setIsModalOpen(true)
  }

  const handleToggle = async (id: string, completed: boolean) => {
    setOptimisticTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    try {
      await toggleTaskComplete(id, completed)
    } catch (error) {
      console.error(error)
      setOptimisticTasks(tasks || [])
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setOptimisticTasks(prev => prev.filter(t => t.id !== id))
      try {
        await deleteTask(id)
      } catch (error) {
        console.error(error)
        setOptimisticTasks(tasks || [])
      }
    }
  }

  const handleAddComment = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newCommentText = commentText
    const optimisticComment: Comment = {
      id: Date.now().toString(),
      comment: newCommentText,
      created_at: new Date().toISOString()
    }

    setOptimisticTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, task_comments: [...(t.task_comments || []), optimisticComment] }
      }
      return t
    }))
    
    setCommentText('')
    setIsSubmittingComment(true)

    try {
      const formData = new FormData()
      formData.append('task_id', taskId)
      formData.append('comment', newCommentText)
      await addTaskComment(formData)
    } catch (error) {
      console.error(error)
      setOptimisticTasks(tasks || [])
      setCommentText(newCommentText)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedTaskId(prev => prev === id ? null : id)
  }

  const displayDate = new Date(currentDate)

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {format(displayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(displayDate, 'EEEE')}
            </h1>
            <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
              <button onClick={handlePrevDay} className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleToday} className="px-3 py-1 text-sm font-medium rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition mx-1">
                Today
              </button>
              <button onClick={handleNextDay} className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {format(displayDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <button 
          onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <PlusCircle size={20} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </header>

      <div className="space-y-4">
        {optimisticTasks.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks for this day</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new task.</p>
          </div>
        ) : (
          optimisticTasks.map((task) => (
            <div 
              key={task.id} 
              className={`group flex flex-col p-4 rounded-xl border transition-all duration-200 ease-in-out ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-60' 
                  : 'bg-white border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggle(task.id, !task.completed); }}
                  className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 size={24} className="text-blue-600" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(task.id)}>
                  <h3 className={`text-base font-medium truncate transition-all ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md transition-colors ${
                      task.priority === 'high' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    
                    <span className="text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded-md">
                      {format(new Date(task.start_date), 'MMM d')} - {format(new Date(task.end_date), 'MMM d')}
                    </span>
                    
                    {task.duration && (
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Clock size={14} />
                        {task.duration} min
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <MessageSquare size={14} />
                      {task.task_comments?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    aria-label="Edit task"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Expandable Comments Section */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedTaskId === task.id ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 ml-10">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Daily Progress</h4>
                  
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                    {(!task.task_comments || task.task_comments.length === 0) ? (
                      <p className="text-sm text-gray-500 italic">No progress logged yet.</p>
                    ) : (
                      task.task_comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={(e) => handleAddComment(e, task.id)} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a progress note..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editTask={taskToEdit}
      />
    </>
  )
}
