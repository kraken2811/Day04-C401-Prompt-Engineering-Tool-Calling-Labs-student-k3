import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Plane, User, LogIn, KeyRound } from 'lucide-react'
import Home from '@/pages/Home'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { hasGroqKey } from '@/lib/groqClient'

const STORAGE_KEY = 'travel-planner-user'

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem(STORAGE_KEY))

  function signIn(name) {
    localStorage.setItem(STORAGE_KEY, name)
    setUser(name)
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <SignIn onSignIn={signIn} />}
        />
        <Route
          path="/"
          element={user ? <Home onSignOut={signOut} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function SignIn({ onSignIn }) {
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (name.trim()) onSignIn(name.trim())
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-5">
          <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plane className="h-11 w-11" strokeWidth={2.25} />
          </span>
          <h1 className="text-center text-4xl font-bold tracking-tight">AI Travel Planner</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên"
            aria-label="Tên"
            autoFocus
          />
          <Button type="submit" size="lg" className="w-full" disabled={!name.trim()}>
            <LogIn className="h-7 w-7" strokeWidth={2.5} />
            Vào
          </Button>
        </form>

        {!hasGroqKey() ? (
          <p className="mt-6 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-base">
            <KeyRound className="h-6 w-6 shrink-0 text-accent" strokeWidth={2} />
            Thiếu VITE_GROQ_API_KEY trong .env
          </p>
        ) : null}
      </Card>
    </div>
  )
}
