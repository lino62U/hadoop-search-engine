import { useLocation } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { VideoGridItem } from '../components/VideoGridItem'
import searchWords from '../services/searchVideos'
import type { IVideo } from '../interfaces/video.interface'
import { videoUrls } from '../data/videos'
export default function SearchPage() {
  const location = useLocation()

  const keywords = useMemo(() => {
    const queryParams = new URLSearchParams(location.search)
    return queryParams.getAll('q')
  }, [location.search])

  const [videos, setVideos] = useState<IVideo[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      const res = await searchWords(keywords)
      setVideos(res)
    }
    fetchResults()
  }, [keywords])

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Resultados de búsqueda</h1>

      {videos.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {videos.map(video => {
            const videoUrl = videoUrls[video.id] || '' // Fallback vacío si no se encuentra
            return (
              <VideoGridItem
                key={video.id}
                id={video.id}
                duration={5}
                title={video.id}
                thumbnailUrl="https://i.ytimg.com/vi/B4Y9Ed4lLAI/maxresdefault.jpg"
                videoUrl={videoUrl}
                views={video.puntuacion}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
