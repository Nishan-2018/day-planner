'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const duration = parseInt(formData.get('duration') as string) || 30
  const is_everyday = formData.get('is_everyday') === 'on'

  const { error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      description,
      priority,
      start_date,
      end_date,
      duration,
      is_everyday
    })

  if (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }

  revalidatePath('/', 'layout')
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const duration = parseInt(formData.get('duration') as string) || 30
  const is_everyday = formData.get('is_everyday') === 'on'

  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      description,
      priority,
      start_date,
      end_date,
      duration,
      is_everyday
    })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }

  revalidatePath('/', 'layout')
}

export async function toggleTaskComplete(taskId: string, completed: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)

  if (error) {
    console.error('Error toggling task:', error)
    throw new Error('Failed to toggle task')
  }

  revalidatePath('/', 'layout')
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }

  revalidatePath('/', 'layout')
}

export async function addTaskComment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const task_id = formData.get('task_id') as string
  const comment = formData.get('comment') as string

  if (!comment.trim()) return

  const { error } = await supabase
    .from('task_comments')
    .insert({
      user_id: user.id,
      task_id,
      comment
    })

  if (error) {
    console.error('Error adding comment:', error)
    throw new Error('Failed to add comment')
  }

  revalidatePath('/', 'layout')
}
