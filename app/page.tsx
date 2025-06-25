import Navigation from '@/components/Navigation'
import DashboardStats from '@/components/DashboardStats'
import RecentItems from '@/components/RecentItems'
import QuickActions from '@/components/QuickActions'

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Storage Dashboard
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your home storage system and track your items
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <DashboardStats />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Recent Items */}
          <div>
            <RecentItems />
          </div>
        </div>
      </main>
    </>
  )
} 