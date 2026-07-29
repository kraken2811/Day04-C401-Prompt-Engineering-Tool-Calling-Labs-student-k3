import { cn } from '@/lib/utils'

export function Input({ className, icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon ? (
        <Icon
          className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
          strokeWidth={2}
        />
      ) : null}
      <input
        className={cn(
          'h-16 w-full rounded-lg border border-input bg-muted pr-5 text-xl font-medium placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none',
          Icon ? 'pl-16' : 'pl-5',
          className,
        )}
        {...props}
      />
    </div>
  )
}
