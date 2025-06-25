'use client'

import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

const quickActions = [
  {
    name: 'Add New Item',
    href: '/items/add',
    icon: PlusIcon,
    description: 'Add a new item to your storage',
    color: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600',
  },
  {
    name: 'Search Items',
    href: '/search',
    icon: MagnifyingGlassIcon,
    description: 'Find items in your storage',
    color: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600',
  },
  {
    name: 'Manage Boxes',
    href: '/boxes',
    icon: ArchiveBoxIcon,
    description: 'View and organize your boxes',
    color: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600',
  },
  {
    name: 'Manage Categories',
    href: '/categories',
    icon: TagIcon,
    description: 'Organize your item categories',
    color: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600',
  },
]

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`${action.color} text-white rounded-lg p-6 block hover:shadow-lg dark:hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500`}
          >
            <div className="flex flex-col items-center text-center">
              <action.icon className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-medium mb-1">{action.name}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 