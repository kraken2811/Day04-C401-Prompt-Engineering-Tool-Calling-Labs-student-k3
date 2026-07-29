import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CloudSun,
  ShieldCheck,
  Route,
  MapPin,
  BedDouble,
  CarTaxiFront,
  CalendarDays,
  Plane,
  TriangleAlert,
  LogOut,
} from 'lucide-react'
import ChatInput from '@/components/chatbot/ChatInput'
import FunctionTrace from '@/components/chatbot/FunctionTrace'
import AdvisoryCard from '@/components/chatbot/AdvisoryCard'
import WeatherCard from '@/components/chatbot/WeatherCard'
import TripPlanCard from '@/components/chatbot/TripPlanCard'
import PlacesCard from '@/components/chatbot/PlacesCard'
import HotelCard from '@/components/chatbot/HotelCard'
import TransportCard from '@/components/chatbot/TransportCard'
import ScheduleTable from '@/components/chatbot/ScheduleTable'
import ToolUsageBox from '@/components/chatbot/ToolUsageBox'
import PaywallModal from '@/components/chatbot/PaywallModal'
import { Button } from '@/components/ui/button'
import {
  getWeather,
  checkRequest,
  getTripPlan,
  getPlaces,
  getHotels,
  getTransportPricing,
  generateSchedule,
} from '@/lib/travelApi'

// Thu tu hien thi. Viec chay song song duoc quyet dinh trong handleSubmit.
const PIPELINE = [
  { name: 'getWeather', icon: CloudSun },
  { name: 'checkRequest', icon: ShieldCheck },
  { name: 'getTripPlan', icon: Route },
  { name: 'getPlaces', icon: MapPin },
  { name: 'getHotels', icon: BedDouble },
  { name: 'getTransportPricing', icon: CarTaxiFront },
  { name: 'generateSchedule', icon: CalendarDays },
]

const initialSteps = () => PIPELINE.map((step) => ({ ...step, status: 'pending', result: null }))

export default function Home({ onSignOut }) {
  const [steps, setSteps] = useState(initialSteps)
  const [results, setResults] = useState({})
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paywall, setPaywall] = useState(false)

  function mark(name, patch) {
    setSteps((prev) => prev.map((s) => (s.name === name ? { ...s, ...patch } : s)))
  }

  function skipRemaining() {
    setSteps((prev) => prev.map((s) => (s.status === 'pending' ? { ...s, status: 'skipped' } : s)))
  }

  /** Chay mot buoc: danh dau running -> done/error, luu result. */
  async function runStep(name, fn) {
    mark(name, { status: 'running' })
    try {
      const result = await fn()
      mark(name, { status: 'done', result })
      setResults((prev) => ({ ...prev, [name]: result }))
      return result
    } catch (err) {
      mark(name, { status: 'error', error: String(err.message ?? err) })
      throw err
    }
  }

  async function handleSubmit(input) {
    const { departure, destination, budget, objective } = input

    setLoading(true)
    setError(null)
    setResults({})
    setTrip(input)
    setSteps(initialSteps())

    try {
      const weather = await runStep('getWeather', () => getWeather(destination))

      // Chan som cac yeu cau bat hop ly de khong ton thoi gian cho buoc nang.
      const check = await runStep('checkRequest', () =>
        checkRequest({ departure, destination, budget, objective, weather }),
      )
      if (check.verdict === 'block') {
        skipRemaining()
        return
      }

      // Bon buoc nay doc lap voi nhau => chay song song thay vi noi duoi.
      const [tripPlan, places, hotels, transport] = await Promise.all([
        runStep('getTripPlan', () =>
          getTripPlan(departure, destination, budget, objective, weather),
        ),
        runStep('getPlaces', () => getPlaces(destination, budget)),
        runStep('getHotels', () => getHotels(destination, budget)),
        runStep('getTransportPricing', async () => getTransportPricing()),
      ])

      await runStep('generateSchedule', () =>
        generateSchedule({
          departure,
          destination,
          budget,
          objective,
          weather,
          tripPlan,
          places,
          hotels,
          transport,
        }),
      )
    } catch (err) {
      setError(String(err.message ?? err))
      skipRemaining()
    } finally {
      setLoading(false)
    }
  }

  const started = steps.some((s) => s.status !== 'pending')

  return (
    <div className="container space-y-6 py-10">
      <header className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plane className="h-9 w-9" strokeWidth={2.25} />
        </span>
        <h1 className="flex-1 text-4xl font-bold tracking-tight sm:text-5xl">AI Travel Planner</h1>
        <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Đăng xuất">
          <LogOut className="h-6 w-6" strokeWidth={2} />
        </Button>
      </header>

      <ChatInput
        onSubmit={handleSubmit}
        onRefine={() => setPaywall(true)}
        loading={loading}
        submitted={trip}
      />

      {started ? <FunctionTrace steps={steps} /> : null}

      {error ? (
        <div className="surface flex items-start gap-4 border-red-500/40 bg-red-500/10 p-6">
          <TriangleAlert className="h-7 w-7 shrink-0 text-red-700" strokeWidth={2} />
          <p className="text-lg leading-relaxed">{error}</p>
        </div>
      ) : null}

      <AnimatePresence>
        {PIPELINE.map(({ name }) => {
          const data = results[name]
          if (!data) return null
          const card = renderCard(name, data, trip?.destination)
          if (!card) return null
          return (
            <motion.section
              key={name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {card}
            </motion.section>
          )
        })}
      </AnimatePresence>

      <ToolUsageBox steps={steps} />

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />
    </div>
  )
}

function scrollToForm() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function renderCard(name, data, location) {
  switch (name) {
    case 'getWeather':
      return <WeatherCard data={data} />
    case 'checkRequest':
      // Yeu cau hop ly thi khong can lam phien nguoi dung.
      return data.verdict === 'ok' ? null : <AdvisoryCard data={data} onEdit={scrollToForm} />
    case 'getTripPlan':
      return <TripPlanCard data={data} />
    case 'getPlaces':
      return <PlacesCard data={data} location={location} />
    case 'getHotels':
      return <HotelCard data={data} location={location} />
    case 'getTransportPricing':
      return <TransportCard data={data} />
    case 'generateSchedule':
      return <ScheduleTable data={data} />
    default:
      return null
  }
}
