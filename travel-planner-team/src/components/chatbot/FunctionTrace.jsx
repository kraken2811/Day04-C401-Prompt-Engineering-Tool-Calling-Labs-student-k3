import { motion } from 'framer-motion'
import { Check, Loader2, X, Circle, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS = {
  pending: { Icon: Circle, className: 'text-muted-foreground/50', spin: false },
  running: { Icon: Loader2, className: 'text-accent', spin: true },
  done: { Icon: Check, className: 'text-primary', spin: false },
  error: { Icon: X, className: 'text-red-700', spin: false },
  skipped: { Icon: Minus, className: 'text-muted-foreground/50', spin: false },
}

export default function FunctionTrace({ steps }) {
  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step) => {
        const { Icon, className, spin } = STATUS[step.status] ?? STATUS.pending
        return (
          <motion.div
            key={step.name}
            layout
            className={cn(
              'flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3',
              step.status === 'running' && 'border-accent/50',
              step.status === 'done' && 'border-primary/40',
              step.status === 'error' && 'border-red-500/40',
              step.status === 'skipped' && 'opacity-50',
            )}
          >
            <step.icon className="h-6 w-6 text-muted-foreground" strokeWidth={2} />
            <code className="text-base font-medium">{step.name}</code>
            <Icon className={cn('h-5 w-5', className, spin && 'animate-spin')} strokeWidth={2.5} />
          </motion.div>
        )
      })}
    </div>
  )
}
