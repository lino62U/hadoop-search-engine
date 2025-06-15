import { useLocation } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { VideoGridItem } from '../components/VideoGridItem'

type IVideo = {
  id: string
  puntuacion: number
}

export default function SearchPage() {
  const location = useLocation()

  const keywords = useMemo(() => {
    const queryParams = new URLSearchParams(location.search)
    return queryParams.getAll('q')  // permite múltiples palabras: ?q=perro&q=persona
  }, [location.search])

  const [videos, setVideos] = useState<IVideo[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const query = keywords.join(',')
        const res = await fetch(`http://localhost:5000/buscar?q=${query}`)
        const data = await res.json()
        setVideos(data.videos)  // [{ id: "prueba2.mp4", puntuacion: 5 }, ...]
      } catch (err) {
        console.error("Error fetching search results", err)
      }
    }

    if (keywords.length > 0) fetchResults()
  }, [keywords])

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Resultados de búsqueda</h1>

      {videos.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {videos.map(video => (
            <VideoGridItem
            key={video.id}
            id={video.id}
            duration={5}
            title={video.id}
            thumbnailUrl="https://i.ytimg.com/vi/B4Y9Ed4lLAI/maxresdefault.jpg"
            videoSrc={`http://localhost:5000/video/${video.id}`}  // para hover
            views={video.puntuacion}
          />
          
          ))}
        </div>
      )}
    </div>
  )
}
