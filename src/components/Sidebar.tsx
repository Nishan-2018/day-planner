'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Settings, LogOut } from 'lucide-react'
import { signout } from '@/app/login/actions'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 h-full">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">DP</span>
            Day Planner
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          <button 
            onClick={() => signout()} 
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={20} className="text-gray-400 group-hover:text-red-700 dark:group-hover:text-red-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pb-safe z-50">
        <div className="flex items-center justify-around p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <item.icon size={24} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
