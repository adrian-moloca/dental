/**
 * Dashboard Page - Overview and key metrics
 */

import { Icon } from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      label: 'Total Patients',
      value: '1,248',
      change: '+12%',
      trend: 'up',
      icon: 'users',
      color: 'bg-blue-500/20 text-blue-300',
      href: '/patients',
    },
    {
      label: "Today's Appointments",
      value: '24',
      change: '3 pending',
      trend: 'neutral',
      icon: 'calendar',
      color: 'bg-purple-500/20 text-purple-300',
      href: '/appointments',
    },
    {
      label: 'Outstanding Balance',
      value: '$12,450',
      change: '-8%',
      trend: 'down',
      icon: 'cash',
      color: 'bg-green-500/20 text-green-300',
      href: '/billing',
    },
    {
      label: 'Low Stock Items',
      value: '8',
      change: 'Action needed',
      trend: 'warning',
      icon: 'exclamation',
      color: 'bg-red-500/20 text-red-300',
      href: '/inventory',
    },
  ];

  const quickActions = [
    {
      label: 'New Patient',
      description: 'Register a new patient',
      icon: 'plus',
      color: 'bg-brand',
      action: () => navigate('/patients/new'),
    },
    {
      label: 'Schedule Appointment',
      description: 'Book a new appointment',
      icon: 'calendar',
      color: 'bg-purple-500',
      action: () => navigate('/appointments/create'),
    },
    {
      label: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: 'document',
      color: 'bg-green-500',
      action: () => navigate('/billing'),
    },
    {
      label: 'Upload X-Ray',
      description: 'Add imaging study',
      icon: 'document',
      color: 'bg-cyan-500',
      action: () => navigate('/imaging'),
    },
  ];

  const recentActivity = [
    {
      type: 'appointment',
      title: 'Appointment completed',
      description: 'John Smith - Teeth Cleaning',
      time: '10 minutes ago',
      icon: 'check',
      color: 'bg-green-500/20 text-green-300',
    },
    {
      type: 'payment',
      title: 'Payment received',
      description: '$450.00 from Sarah Johnson',
      time: '25 minutes ago',
      icon: 'cash',
      color: 'bg-blue-500/20 text-blue-300',
    },
    {
      type: 'patient',
      title: 'New patient registered',
      description: 'Michael Brown',
      time: '1 hour ago',
      icon: 'users',
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      type: 'inventory',
      title: 'Low stock alert',
      description: 'Composite Resin - 2 units left',
      time: '2 hours ago',
      icon: 'exclamation',
      color: 'bg-red-500/20 text-red-300',
    },
  ];

  const upcomingAppointments = [
    {
      id: '1',
      patient: 'Emma Wilson',
      time: '09:00 AM',
      type: 'Consultation',
      provider: 'Dr. Smith',
    },
    {
      id: '2',
      patient: 'David Martinez',
      time: '10:30 AM',
      type: 'Root Canal',
      provider: 'Dr. Johnson',
    },
    {
      id: '3',
      patient: 'Lisa Anderson',
      time: '02:00 PM',
      type: 'Cleaning',
      provider: 'Dr. Smith',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          {user?.email} • {user?.roles?.join(', ') || 'User'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.href)}
            className="p-6 bg-surface rounded-lg border border-white/10 hover:border-brand transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon name={stat.icon as any} className="w-6 h-6" />
              </div>
              <span
                className={`text-xs font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-400'
                    : stat.trend === 'down'
                    ? 'text-red-400'
                    : stat.trend === 'warning'
                    ? 'text-yellow-400'
                    : 'text-foreground/60'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-sm text-foreground/60 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-foreground group-hover:text-brand transition-colors">
              {stat.value}
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="p-6 bg-surface rounded-lg border border-white/10 hover:border-brand transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon name={action.icon as any} className="w-6 h-6 text-white" />
              </div>
              <div className="text-foreground font-semibold mb-1 group-hover:text-brand transition-colors">
                {action.label}
              </div>
              <div className="text-sm text-foreground/60">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 bg-surface rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
                  <Icon name={activity.icon as any} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{activity.title}</div>
                  <div className="text-sm text-foreground/60 truncate">{activity.description}</div>
                  <div className="text-xs text-foreground/40 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-brand hover:text-brand/80 transition-colors">
            View all activity
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="p-6 bg-surface rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Today's Appointments</h2>
            <button
              onClick={() => navigate('/appointments')}
              className="text-sm text-brand hover:text-brand/80 transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 bg-surface-hover rounded-lg hover:bg-surface-hover/80 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-foreground font-medium">{appt.patient}</div>
                    <div className="text-sm text-foreground/60">{appt.type}</div>
                  </div>
                  <div className="text-brand font-semibold text-sm">{appt.time}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  <Icon name="users" className="w-4 h-4" />
                  {appt.provider}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-lg border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <Icon name="calendar" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Appointment Rate</h3>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">94%</div>
          <div className="text-sm text-foreground/60">Show rate this week</div>
          <div className="mt-4 h-2 bg-surface-hover rounded-full overflow-hidden">
            <div className="h-full w-[94%] bg-blue-500 rounded-full" />
          </div>
        </div>

        <div className="p-6 bg-surface rounded-lg border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-300">
              <Icon name="cash" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Collection Rate</h3>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">87%</div>
          <div className="text-sm text-foreground/60">Payments collected this month</div>
          <div className="mt-4 h-2 bg-surface-hover rounded-full overflow-hidden">
            <div className="h-full w-[87%] bg-green-500 rounded-full" />
          </div>
        </div>

        <div className="p-6 bg-surface rounded-lg border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
              <Icon name="users" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Patient Satisfaction</h3>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">4.8</div>
          <div className="text-sm text-foreground/60">Average rating this month</div>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name="check"
                className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-foreground/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
