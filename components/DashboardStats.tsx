'use client'

import { useEffect, useState } from 'react'
import {
  ArchiveBoxIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

interface Stats {
  totalBoxes: number
  totalItems: number
  itemsInBox: number
  itemsOutOfBox: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalBoxes: 0,
    totalItems: 0,
    itemsInBox: 0,
    itemsOutOfBox: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Boxes',
      value: stats.totalBoxes,
      icon: ArchiveBoxIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Total Items',
      value: stats.totalItems,
      icon: CubeIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      name: 'Items In Box',
      value: stats.itemsInBox,
      icon: CheckCircleIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Items Out of Box',
      value: stats.itemsOutOfBox,
      icon: ExclamationCircleIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((card) => (
        <div key={card.name} className="card hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.bgColor} transition-colors duration-200`}>
              <card.icon className={`h-6 w-6 ${card.color} transition-colors duration-200`} />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate transition-colors duration-200">
                {card.name}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 