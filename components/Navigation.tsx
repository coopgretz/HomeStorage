'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import ThemeToggle from './ThemeToggle'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  TagIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Boxes', href: '/boxes', icon: ArchiveBoxIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Add Item', href: '/items/add', icon: PlusIcon },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                📦 HomeStorage
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                      {user.email}
                    </span>
                    <ThemeToggle />
                    <Link
                      href="/account"
                      className={`${
                        pathname === '/account'
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } p-2 rounded-lg transition-colors duration-200`}
                      title="Account Settings"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <Link
                      href="/login"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
          
          {/* Mobile user menu */}
          {!loading && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center pl-3 pr-4 py-2">
                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {user.email}
                    </span>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      pathname === '/account'
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    } flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-3" />
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  )
} 