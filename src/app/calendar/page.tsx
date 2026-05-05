import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarClient } from '@/components/CalendarClient'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all tasks for the user to display on the calendar
  // For a production app, you might want to filter this by the current month to save bandwidth
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, start_date, end_date, completed')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CalendarClient tasks={tasks} />
    </div>
  )
}
