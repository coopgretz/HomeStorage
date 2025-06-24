import Navigation from '@/components/Navigation'
import BoxContents from '@/components/BoxContents'

interface Props {
  params: { id: string }
}

export default function BoxPage({ params }: Props) {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <BoxContents boxId={parseInt(params.id)} />
      </main>
    </>
  )
} 