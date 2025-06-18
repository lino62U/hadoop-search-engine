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
  const [videoMap, setVideoMap] = useState<VideoEntry[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/videos_random`);
      const data = await response.json();
      setVideoMap(data)
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
                      {videoMap.map(vid => (
                        <VideoGridItem
                          key={vid.id}
                          id={vid.id}
                          title={vid.id}
                          duration={5}
                          thumbnailUrl="https://images.squarespace-cdn.com/content/v1/5e2f2c9ca1e8e420307e5fb0/1738163221197-GCEA4X24CFESOKTP3KIT/Parking+lot+full+of+cars+1893843900-Web.jpg"
                          videoUrl={vid.id}
                          views={vid.frecuencia}
                        />
                      ))}

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
