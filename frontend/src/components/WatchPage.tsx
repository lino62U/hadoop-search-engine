// src/pages/WatchPage.tsx
import { useParams } from 'react-router-dom'

export default function WatchPage() {
  const { id } = useParams()
  if (!id) {
    return <div className="p-8 text-red-500">No se proporcionó un ID de video</div>
  }

  return (
    <div className="p-8 flex justify-center">
      <iframe
        className="w-[1180px] h-[660px] rounded-xl shadow-lg"
        src={`https://www.youtube.com/embed/${"ylq4JKSZrAA"}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}
