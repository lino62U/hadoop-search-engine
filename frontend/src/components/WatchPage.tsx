import { useParams } from 'react-router-dom'

export default function WatchPage() {
  const { id } = useParams()
  if (!id) {
    return <div className="p-8 text-red-500">No se proporcionó un ID de video</div>
  }

  return (
    <div className="p-8 flex justify-center">
      <video
        className="w-[1180px] h-[660px] rounded-xl shadow-lg"
        controls
        autoPlay
      >
        <source src={`http://localhost:5000/video/${id}`} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
  )
}
