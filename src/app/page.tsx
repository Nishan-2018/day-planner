import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { date } = await searchParams
  const today = date ? format(new Date(date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')

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
    .or(`end_date.gte.${today},completed.eq.false,is_everyday.eq.true`)
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DashboardClient tasks={tasks} currentDate={today} />
    </div>
  )
}
