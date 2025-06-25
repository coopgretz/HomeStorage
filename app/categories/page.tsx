import Navigation from '@/components/Navigation'
import CategoryManager from '@/components/CategoryManager'

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
              Manage Categories
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Create and organize categories to better organize your stored items
            </p>
          </div>
          
          <CategoryManager />
        </div>
      </main>
    </div>
  )
} 