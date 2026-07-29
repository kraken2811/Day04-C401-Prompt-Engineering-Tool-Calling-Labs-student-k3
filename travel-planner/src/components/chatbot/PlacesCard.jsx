import { useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, UtensilsCrossed, Waves, MapPin } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import MapModal from '@/components/chatbot/MapModal'
import { cn, formatVnd } from '@/lib/utils'

const TABS = [
  { key: 'attractions', icon: Landmark, priceKey: 'ticketPrice' },
  { key: 'restaurants', icon: UtensilsCrossed, priceKey: 'avgPrice' },
  { key: 'activities', icon: Waves, priceKey: 'price' },
]

export default function PlacesCard({ data, location }) {
  const [tab, setTab] = useState('attractions')
  const active = TABS.find((t) => t.key === tab)
  const items = data?.[tab] ?? []

  return (
    <Card>
      <CardTitle
        icon={MapPin}
        title="Địa điểm"
        action={
          <div className="flex gap-2 rounded-lg bg-muted p-1.5">
            {TABS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-label={key}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-md transition-colors',
                  tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card',
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={`${tab}-${item.name}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-muted p-5"
          >
            <p className="text-xl font-semibold leading-tight">{item.name}</p>
            {item.highlight ?? item.cuisine ?? item.note ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.highlight ?? item.cuisine ?? item.note}
              </p>
            ) : null}
            {item.address ?? item.area ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                {item.address ?? item.area}
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-3">
              <p className="flex-1 text-2xl font-semibold tabular-nums text-primary">
                {item.priceEstimated && item[active.priceKey] != null ? '~' : ''}
                {formatVnd(item[active.priceKey])}
              </p>
              <MapModal
                query={[item.name, item.address ?? item.area, location].filter(Boolean).join(', ')}
                lat={item.lat}
                lon={item.lon}
                title={item.name}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
