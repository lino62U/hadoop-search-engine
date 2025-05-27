import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CategoryPills } from './components/CategoryPills'
import { SidebarProvider } from './contexts/SidebarProvider'
import { PageHeader } from './layouts/PageHeader'
import { VideoGridItem } from './components/VideoGridItem'
import { useState } from 'react'
import { categories, videos } from './data/home'
import SearchPage from './components/SearchPage'
import WatchPage from './components/WatchPage'


export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

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
                      {videos.map(video => (
                        <VideoGridItem key={video.id} {...video} />
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
