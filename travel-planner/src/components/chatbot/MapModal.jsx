import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Map, ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Toa do OSM chinh xac hon tim theo ten => uu tien khi co. */
function point({ query, lat, lon }) {
  return lat != null && lon != null ? `${lat},${lon}` : query
}

/* Google Maps embed khong can API key khi dung output=embed. */
function embedUrl(target) {
  const params = target.origin
    ? `saddr=${encodeURIComponent(target.origin)}&daddr=${encodeURIComponent(target.destination)}`
    : `q=${encodeURIComponent(point(target))}&z=${target.lat != null ? 17 : 15}`
  return `https://maps.google.com/maps?${params}&hl=vi&output=embed`
}

function externalUrl(target) {
  return target.origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(target.origin)}&destination=${encodeURIComponent(target.destination)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point(target))}`
}

/**
 * Nut icon mo modal ban do. Dung `query` cho mot dia diem,
 * hoac `origin` + `destination` cho chi duong.
 */
export default function MapModal({ query, lat, lon, origin, destination, title, className }) {
  const [open, setOpen] = useState(false)
  const target = { query, lat, lon, origin, destination }
  const label = title ?? (origin ? `${origin} → ${destination}` : query)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Bản đồ ${label}`}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary',
          className,
        )}
      >
        <Map className="h-5 w-5" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 sm:p-8"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="surface flex h-full max-h-[46rem] w-full max-w-5xl flex-col overflow-hidden p-0 shadow-2xl"
            >
              <div className="flex items-center gap-4 border-b border-border p-5">
                <Map className="h-7 w-7 shrink-0 text-primary" strokeWidth={2} />
                <h3 className="flex-1 truncate text-2xl font-semibold tracking-tight">{label}</h3>
                <a
                  href={externalUrl(target)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Mở Google Maps"
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ExternalLink className="h-6 w-6" strokeWidth={2} />
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Đóng"
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-6 w-6" strokeWidth={2} />
                </button>
              </div>

              <iframe
                title={label}
                src={embedUrl(target)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full flex-1 border-0"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
