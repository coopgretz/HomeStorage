import Navigation from '@/components/Navigation'
import BoxContents from '@/components/BoxContents'

interface Props {
  params: { id: string }
}

export default function BoxPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="flex-1">
        <BoxContents boxId={parseInt(params.id)} />
      </main>
    </div>
  )
} 