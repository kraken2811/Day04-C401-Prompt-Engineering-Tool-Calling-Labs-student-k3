import { motion } from 'framer-motion'
import { BedDouble, Star, Moon, MapPin } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import MapModal from '@/components/chatbot/MapModal'
import { formatVnd } from '@/lib/utils'

export default function HotelCard({ data, location }) {
  const hotels = data?.hotels ?? []

  return (
    <Card>
      <CardTitle icon={BedDouble} title="Chỗ ở" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {hotels.map((hotel, i) => (
          <motion.div
            key={hotel.name}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col rounded-lg border border-border bg-muted p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xl font-semibold leading-tight">{hotel.name}</p>
              {hotel.rating ? (
                <span className="flex shrink-0 items-center gap-1.5 text-lg font-semibold tabular-nums text-accent">
                  <Star className="h-5 w-5 fill-current" strokeWidth={0} />
                  {hotel.rating}
                </span>
              ) : null}
            </div>
            {hotel.kindLabel ?? hotel.type ? (
              <p className="mt-1 text-sm font-medium uppercase tracking-wide text-primary">
                {hotel.kindLabel ?? hotel.type}
              </p>
            ) : null}
            {hotel.highlight ? (
              <p className="mt-1 text-sm text-muted-foreground">{hotel.highlight}</p>
            ) : null}
            {hotel.address ?? hotel.area ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                {hotel.address ?? hotel.area}
              </p>
            ) : null}
            <div className="mt-auto flex items-center gap-3 pt-4">
              <p className="flex flex-1 items-baseline gap-2 text-2xl font-semibold tabular-nums text-primary">
                {hotel.priceEstimated && hotel.pricePerNight != null ? '~' : ''}
                {formatVnd(hotel.pricePerNight)}
                <Moon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
              </p>
              <MapModal
                query={[hotel.name, hotel.address ?? hotel.area, location].filter(Boolean).join(', ')}
                lat={hotel.lat}
                lon={hotel.lon}
                title={hotel.name}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
