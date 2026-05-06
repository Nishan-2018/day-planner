export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 ease-out fill-mode-both">
      {children}
    </div>
  )
}
