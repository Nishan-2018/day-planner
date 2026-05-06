export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse mt-2">
      {/* Skeleton Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-3">
          <div className="h-8 w-32 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-100 dark:bg-zinc-900 rounded-lg"></div>
        </div>
        <div className="h-10 w-28 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
      </div>

      {/* Skeleton Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 h-28">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-6 w-6 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-zinc-800 rounded-lg"></div>
                <div className="flex gap-3 pt-1">
                  <div className="h-6 w-16 bg-gray-100 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-6 w-24 bg-gray-100 dark:bg-zinc-800 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
