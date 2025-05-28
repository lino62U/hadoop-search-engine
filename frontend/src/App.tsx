import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CategoryPills } from './components/CategoryPills'
import { SidebarProvider } from './contexts/SidebarProvider'
import { PageHeader } from './layouts/PageHeader'
import { VideoGridItem } from './components/VideoGridItem'
import { useEffect, useState } from 'react'
import SearchPage from './components/SearchPage'
import WatchPage from './components/WatchPage'
import { categories } from './data/home'

type VideoEntry = { id: string, frecuencia: number }

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [videoMap, setVideoMap] = useState<Record<string, VideoEntry[]>>({})

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/leer?ruta=/inverted_index/part-00000`);
      const data = await response.json();
      const contenido = data.contenido;

      const lineas = contenido.trim().split("\n");
      const resultado: Record<string, VideoEntry[]> = {}

      for (const linea of lineas) {
        const [palabra, valores] = linea.split("\t")
        const archivos = valores.split(",").map(par => {
          const [archivo, frecuencia] = par.split(":")
          return {
            id: archivo,
            frecuencia: Number(frecuencia),
          }
        })
        resultado[palabra] = archivos
      }

      setVideoMap(resultado)
    }

    fetchData()
  }, [])

  return (
    <SidebarProvider>
      <BrowserRouter>
        <div className="max-h-screen flex flex-col">
          <PageHeader />
          <Routes>
            <Route
              path="/"
              element={
                <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                  <div className="overflow-x-hidden px-8 pb-4">
                    <div className="sticky top-0 bg-white z-10 pb-4">
                      <CategoryPills
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                      />
                    </div>
                    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                      {/* Aquí usamos todos los videos de todas las palabras como ejemplo */}
                      {(() => {
                        const uniqueVideos = new Map<string, VideoEntry>();

                        for (const videos of Object.values(videoMap)) {
                          for (const video of videos) {
                            // Si ya existe el video, puedes decidir si quieres sumar la frecuencia o ignorar
                            if (!uniqueVideos.has(video.id)) {
                              uniqueVideos.set(video.id, { ...video });
                            }
                          }
                        }

                        return Array.from(uniqueVideos.values()).map(video => (
                          <VideoGridItem
                            key={video.id}
                            id={video.id}
                            title={video.id}
                            duration={5}
                            thumbnailUrl="https://i.ytimg.com/vi/B4Y9Ed4lLAI/maxresdefault.jpg"
                            videoUrl={video.id}
                            views={video.frecuencia}
                          />
                        ));
                      })()}

                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SidebarProvider>
  )
}
