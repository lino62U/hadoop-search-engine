import { useLocation } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { VideoGridItem } from '../components/VideoGridItem'
import searchWords from '../services/searchVideos'
import type { IVideo } from '../interfaces/video.interface'

export default function SearchPage() {
  const location = useLocation()

  const keywords = useMemo(() => {
    const queryParams = new URLSearchParams(location.search)
    return queryParams.getAll('q')
  }, [location.search])

  const [videos, setVideos] = useState<IVideo[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      const query = keywords.map(q => `q=${encodeURIComponent(q)}`)
      const res = await searchWords(query)
      setVideos(res)
    }
    fetchResults()
  }, [keywords])

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Resultados de búsqueda</h1>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {videos.map(video => (
          <VideoGridItem key={video.id} duration={5} id={video.id} thumbnailUrl='https://i.ytimg.com/vi/B4Y9Ed4lLAI/maxresdefault.jpg' title='' videoUrl='https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' views={65555} />
        ))}
      </div>
    </div>
  )
}
