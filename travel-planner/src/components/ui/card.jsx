import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('surface p-8', className)} {...props} />
}

/** Tieu de dung icon lam nhan chinh, chu phu toi thieu. */
export function CardTitle({ icon: Icon, title, action, className }) {
  return (
    <div className={cn('mb-6 flex items-center gap-4', className)}>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-7 w-7" strokeWidth={2} />
      </span>
      <h2 className="section-title flex-1">{title}</h2>
      {action}
    </div>
  )
}

export function CardGrid({ className, ...props }) {
  return <div className={cn('grid gap-4', className)} {...props} />
}
