import { useUser, useClerk } from '@clerk/clerk-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { usePatientDashboard } from '@/hooks/usePatientDashboard'
import { useSyncUser } from '@/hooks/useSyncUser'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@clerk/clerk-react'
import {
  HeartPulse, Search, Pill, Truck, Bell, History,
  CalendarDays, CheckCircle, Clock, ChevronRight,
  Loader2, Camera, UserCircle, ShoppingCart, MapPin,
  Stethoscope, CalendarPlus, X
} from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card>
    <CardContent className="flex items-center gap-4 pt-6">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </CardContent>
  </Card>
)

const statusStyle = {
  Confirmed: 'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
}

const quickActions = [
  { icon: Pill,         label: 'My Prescriptions', color: 'bg-pink-50 text-pink-600',   to: '/prescription-cart' },
  { icon: Truck,        label: 'Order Medicines',  color: 'bg-teal-50 text-teal-600',   to: '/prescription-cart' },
  { icon: Bell,         label: 'Reminders',        color: 'bg-yellow-50 text-yellow-600' },
  { icon: History,      label: 'History',          color: 'bg-gray-100 text-gray-600'   },
]

const SPECIALTIES = [
  'All', 'Cardiologist', 'Dermatologist', 'Endocrinologist', 'ENT Specialist',
  'Gastroenterologist', 'General Surgeon', 'Gynaecologist', 'Haematologist',
  'Nephrologist', 'Neurologist', 'Neurosurgeon', 'Oncologist', 'Ophthalmologist',
  'Orthopedic Surgeon', 'Paediatrician', 'Psychiatrist', 'Pulmonologist',
  'Radiologist', 'Rheumatologist', 'Urologist',
]

const DoctorCard = ({ doctor }) => (
  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
    <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
      {doctor.profileImage
        ? <img src={doctor.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" />
        : `${doctor.firstName?.[0]}${doctor.lastName?.[0]}`
      }
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 text-sm">{doctor.title} {doctor.firstName} {doctor.lastName}</p>
      <p className="text-xs text-blue-600 font-medium mt-0.5">{doctor.specialty}</p>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {doctor.location && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={11} /> {doctor.location}
          </span>
        )}
        {doctor.experience && (
          <span className="text-xs text-gray-400">{doctor.experience} yrs exp</span>
        )}
        {doctor.designation && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{doctor.designation}</span>
        )}
      </div>
      {doctor.bio && (
        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{doctor.bio}</p>
      )}
    </div>
    <Button size="sm" className="shrink-0 h-8 px-3 text-xs">
      <CalendarPlus size={13} className="mr-1" /> Book
    </Button>
  </div>
)

const PatientDashboard = () => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error } = usePatientDashboard()
  const [profileImage, setProfileImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const fileInputRef = useRef(null)

  // Search state
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [doctors, setDoctors] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  useSyncUser()

  useEffect(() => {
    apiFetch('/cart', getToken)
      .then(items => setCartCount(items.filter(i => i.inStock).length))
      .catch(() => {})
  }, [])

  const handleSearch = useCallback(async () => {
    setSearching(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (specialty !== 'All') params.set('specialty', specialty)
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${BASE_URL}/doctors/search?${params}`)
      const result = await res.json()
      setDoctors(Array.isArray(result) ? result : [])
    } catch {
      setDoctors([])
    } finally {
      setSearching(false)
    }
  }, [query, specialty])

  const clearSearch = () => {
    setQuery('')
    setSpecialty('All')
    setDoctors([])
    setSearched(false)
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      setProfileImage(base64)
      try {
        setUploading(true)
        await apiFetch('/patients/profile-image', getToken, {
          method: 'PATCH',
          body: JSON.stringify({ profileImage: base64 }),
        })
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const avatarSrc = profileImage || user?.imageUrl

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <HeartPulse size={24} />
          CareNova
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">Patient</span>

          <button
            onClick={() => navigate('/prescription-cart')}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600"
          >
            <ShoppingCart size={22} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
            {avatarSrc
              ? <img src={avatarSrc} alt="profile" className="w-9 h-9 rounded-full object-cover border-2 border-blue-200" />
              : <UserCircle size={36} className="text-gray-400" />
            }
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <Button
            variant="outline" size="sm"
            onClick={() => { localStorage.removeItem('carenova_role'); signOut({ redirectUrl: '/' }) }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full space-y-8">

        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{user?.firstName}!</span>
          </h1>
          <p className="text-gray-500 mt-1">How are you feeling today?</p>
        </div>

        {/* Search Doctors */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Find a Doctor</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, specialty, or location..."
                  className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={15} />
                  </button>
                )}
              </div>
              <select
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
              <Button onClick={handleSearch} disabled={searching} className="px-6 rounded-xl">
                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
              </Button>
              {searched && (
                <button onClick={clearSearch} className="text-sm text-gray-400 hover:text-gray-600 px-2">
                  Clear
                </button>
              )}
            </div>

            {/* Results */}
            {searching && (
              <div className="flex items-center gap-2 text-gray-400 py-4">
                <Loader2 size={16} className="animate-spin" /> Searching doctors...
              </div>
            )}
            {!searching && searched && doctors.length === 0 && (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <Stethoscope size={32} strokeWidth={1} />
                <p className="text-sm">No doctors found. Try a different search.</p>
              </div>
            )}
            {!searching && doctors.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
                </div>
              </div>
            )}
            {!searched && (
              <p className="text-xs text-gray-400 text-center py-2">
                Search from 25+ specialist doctors across India
              </p>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map(({ icon: Icon, label, color, to }) => (
              <button
                key={label}
                onClick={() => to && navigate(to)}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`p-3 rounded-full ${color}`}><Icon size={22} strokeWidth={1.5} /></div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            Failed to load dashboard: {error}
          </div>
        )}

        {/* Stats */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 py-6">
              <Loader2 size={18} className="animate-spin" /> Loading...
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={CalendarDays} label="Total Appointments" value={data?.stats.total}     color="bg-blue-50 text-blue-600"    />
              <StatCard icon={CheckCircle}  label="Completed"          value={data?.stats.completed} color="bg-green-50 text-green-600"  />
              <StatCard icon={Clock}        label="Pending"            value={data?.stats.pending}   color="bg-yellow-50 text-yellow-600"/>
              <StatCard icon={CalendarPlus} label="Upcoming"           value={data?.stats.upcoming}  color="bg-purple-50 text-purple-600"/>
            </div>
          )}
        </section>

        {/* Recent Appointments */}
        {!loading && (
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Appointments</CardTitle>
                  <button className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {data?.recentAppointments?.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">No appointments yet.</p>
                )}
                {data?.recentAppointments?.map(appt => (
                  <div key={appt._id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appt.doctor.specialty && <span className="mr-2">{appt.doctor.specialty}</span>}
                        {new Date(appt.date).toLocaleDateString()} — {appt.time}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

      </main>
    </div>
  )
}

export default PatientDashboard
