import { useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useDashboard } from '@/hooks/useDashboard'
import { useSyncUser } from '@/hooks/useSyncUser'
import ThemeToggle from '@/components/ThemeToggle'
import {
  HeartPulse, CalendarCheck, CalendarDays,
  Users, BookCheck, Clock, ChevronRight, Loader2,
  MapPin, Briefcase
} from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card>
    <CardContent className="flex items-center gap-4 pt-6">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value ?? '—'}</p>
      </div>
    </CardContent>
  </Card>
)

const statusStyle = {
  Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
}

const DoctorDashboard = () => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const { data, loading, error, updateAppointmentStatus } = useDashboard()
  useSyncUser()

  const doctor = data?.doctor

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <HeartPulse size={24} /> MediConnect
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">Doctor</span>
          <ThemeToggle />
          <Button
            variant="outline" size="sm"
            onClick={() => { localStorage.removeItem('mediconnect_role'); signOut({ redirectUrl: '/' }) }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full space-y-8">

        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Good day, <span className="text-blue-600">{doctor?.title || 'Dr.'} {doctor?.lastName || user?.lastName || user?.firstName}!</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your practice overview.</p>
        </div>

        {/* Profile Card + Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center text-center pt-6 pb-6 gap-3">
              {doctor?.profileImage ? (
                <img src={doctor.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-500 text-2xl font-bold">
                  {doctor?.firstName?.[0]}{doctor?.lastName?.[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {doctor?.title} {doctor?.firstName} {doctor?.lastName}
                </p>
                {doctor?.designation && <p className="text-sm text-blue-600 font-medium">{doctor.designation}</p>}
                {doctor?.specialty   && <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>}
              </div>
              <div className="flex flex-col gap-1 w-full text-sm text-gray-500 dark:text-gray-400">
                {doctor?.experience > 0 && (
                  <span className="flex items-center justify-center gap-1">
                    <Briefcase size={13} /> {doctor.experience} years experience
                  </span>
                )}
                {doctor?.location && (
                  <span className="flex items-center justify-center gap-1">
                    <MapPin size={13} /> {doctor.location}
                  </span>
                )}
              </div>
              {doctor?.bio && <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-3">{doctor.bio}</p>}
              <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => navigate('/doctor-profile')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: CalendarCheck, label: 'Manage Availability', color: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300',   onClick: () => {} },
                { icon: CalendarDays,  label: 'View Appointments',   color: 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300',       onClick: () => {} },
                { icon: Users,         label: 'My Patients',         color: 'bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300', onClick: () => {} },
              ].map(({ icon: Icon, label, color, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={`p-3 rounded-full ${color}`}><Icon size={22} strokeWidth={1.5} /></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{label}</span>
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
            Failed to load dashboard data: {error}
          </div>
        )}

        {/* Stats */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 py-6">
              <Loader2 size={18} className="animate-spin" /> Loading stats...
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users}        label="Total Patients"          value={data?.stats.totalPatients}          color="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300"    />
              <StatCard icon={BookCheck}    label="Successfully Appointed"  value={data?.stats.successfullyAppointed}  color="bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300"  />
              <StatCard icon={Clock}        label="Pending Bookings"        value={data?.stats.pendingBookings}        color="bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300"/>
              <StatCard icon={CalendarDays} label="Requested Appointments"  value={data?.stats.requestedAppointments} color="bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300"/>
            </div>
          )}
        </section>

        {/* Appointments + Pending */}
        {!loading && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Appointments</CardTitle>
                  <button className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {data?.todayAppointments?.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">No appointments today.</p>
                )}
                {data?.todayAppointments?.map(appt => (
                  <div key={appt._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{appt.patient.firstName} {appt.patient.lastName}</p>
                      <p className="text-xs text-gray-400">{appt.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Booking Requests</CardTitle>
                  <button className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {data?.pendingRequests?.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">No pending requests.</p>
                )}
                {data?.pendingRequests?.map(appt => (
                  <div key={appt._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{appt.patient.firstName} {appt.patient.lastName}</p>
                      <p className="text-xs text-gray-400">{new Date(appt.date).toLocaleDateString()} — {appt.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 px-3 text-xs" onClick={() => updateAppointmentStatus(appt._id, 'Confirmed')}>Accept</Button>
                      <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => updateAppointmentStatus(appt._id, 'Cancelled')}>Decline</Button>
                    </div>
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

export default DoctorDashboard
