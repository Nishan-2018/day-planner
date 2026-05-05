import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  // Fetch tasks where today is between start_date and end_date (or just end_date for simplicity, but we added start_date)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      task_comments (
        id,
        comment,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DashboardClient tasks={tasks} />
    </div>
  )
}
