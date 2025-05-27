import { useEffect, useRef, useState } from "react"
import { formatDuration } from "../utils/formatDuration"
import { Link } from "react-router-dom"

type VideoGridItemProps = {
  id: string
  title: string
  views: number
  duration: number
  thumbnailUrl: string
  videoUrl: string
}

const VIEW_FORMATTER = new Intl.NumberFormat(undefined, { notation: "compact" })

export function VideoGridItem({
  id,
  title,
  views,
  duration,
  thumbnailUrl,
  videoUrl,
}: VideoGridItemProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current == null) return

    if (isVideoPlaying) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [isVideoPlaying])

  return (
    <div
      className="flex flex-col gap-2"
      onMouseEnter={() => setIsVideoPlaying(true)}
      onMouseLeave={() => setIsVideoPlaying(false)}
    >
      <Link to={`/watch/${id}`} className="relative aspect-video">
        <img
          src={thumbnailUrl}
          className={`block w-full h-full object-cover transition-[border-radius] duration-200 ${isVideoPlaying ? "rounded-none" : "rounded-xl"
            }`}
        />
        <div className="absolute bottom-1 right-1 bg-secondary-dark text-secondary text-sm px-0.5 rounded">
          {formatDuration(duration)}
        </div>
        <video
          className={`block h-full object-cover absolute inset-0 transition-opacity duration-200 ${isVideoPlaying ? "opacity-100 delay-200" : "opacity-0"
            }`}
          ref={videoRef}
          muted
          playsInline
          src={videoUrl}
        />
      </Link>
      <div className="flex gap-2">

        <div className="flex flex-col">
          <Link to={`/watch/${id}`} className="font-bold">
            {title}
          </Link>

          <div className="text-secondary-text text-sm">
            {VIEW_FORMATTER.format(views)} Views
          </div>
        </div>
      </div>
    </div>
  )
}