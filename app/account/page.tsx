import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import AccountManager from '@/components/AccountManager'

export default async function AccountPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Navigation />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Manage your account information and preferences
            </p>
          </div>
          
          <AccountManager user={user} />
        </div>
      </main>
    </>
  )
} 