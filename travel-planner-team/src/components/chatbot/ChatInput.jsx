import { useMemo, useState } from 'react'
import {
  MapPin,
  Navigation,
  Wallet,
  Target,
  Heart,
  Sparkles,
  Loader2,
  Lock,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { formatVnd } from '@/lib/utils'

const MIN_BUDGET = 1_000_000
const MAX_BUDGET = 100_000_000
const STEP = 500_000

export default function ChatInput({ onSubmit, onRefine, loading, submitted }) {
  const [departure, setDeparture] = useState('Hà Nội')
  const [destination, setDestination] = useState('Đà Nẵng')
  const [budget, setBudget] = useState(15_000_000)
  const [objective, setObjective] = useState('')
  const [interests, setInterests] = useState('')

  const current = {
    departure: departure.trim(),
    destination: destination.trim(),
    budget,
    objective: [objective, interests].filter(Boolean).join(' — '),
  }

  // Da co ket qua ma nguoi dung sua lai form => de nghi "goi y lai".
  const edited = useMemo(() => {
    if (!submitted) return false
    return (
      submitted.departure !== current.departure ||
      submitted.destination !== current.destination ||
      submitted.budget !== current.budget ||
      submitted.objective !== current.objective
    )
  }, [submitted, current.departure, current.destination, current.budget, current.objective])

  function handleSubmit(event) {
    event.preventDefault()
    if (!current.departure || !current.destination || loading) return
    onSubmit(current)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            icon={Navigation}
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            aria-label="Điểm xuất phát"
          />
          <Input
            icon={MapPin}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            aria-label="Điểm đến"
          />
        </div>

        <div className="rounded-lg border border-input bg-muted p-6">
          <div className="mb-5 flex items-center gap-4">
            <Wallet className="h-7 w-7 shrink-0 text-primary" strokeWidth={2} />
            <span className="stat-value flex-1 text-primary">{formatVnd(budget)}</span>
            <input
              type="number"
              value={budget}
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="h-12 w-44 rounded-lg border border-input bg-background px-4 text-right text-lg tabular-nums focus:border-primary focus:outline-none"
              aria-label="Ngân sách"
            />
          </div>
          <Slider
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={STEP}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Kéo chọn ngân sách"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            icon={Target}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Mục tiêu"
            aria-label="Mục tiêu"
          />
          <Input
            icon={Heart}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Sở thích"
            aria-label="Sở thích"
          />
        </div>

        <div className="flex gap-4">
          {edited ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onRefine}
            >
              <RefreshCw className="h-7 w-7" strokeWidth={2.5} />
              Gợi ý lại
              <Lock className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
            </Button>
          ) : null}

          <Button type="submit" size="lg" className="flex-1" disabled={loading}>
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin" strokeWidth={2.5} />
            ) : (
              <>
                <Sparkles className="h-7 w-7" strokeWidth={2.5} />
                Lên lịch 7 ngày
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
