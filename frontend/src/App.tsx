import { Sidebar } from "lucide-react";

import { CategoryPills } from "./components/CategoryPills";
import { SidebarProvider } from "./contexts/SidebarProvider";
import { PageHeader } from "./layouts/PageHeader";
import { VideoGridItem } from "./components/VideoGridItem";
import { useEffect, useState } from "react";
import { categories, videos } from "./data/home";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const [usersJson, setUsersJson] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/users")
      .then((response) => response.json())
      .then((data) => setUsersJson(JSON.stringify(data, null, 2)))
      .catch((error) => setUsersJson(`Error: ${error.message}`));
  }, []);

  return (
    <SidebarProvider>
      <div className="max-h-screen flex flex-col">
        <PageHeader />
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
          <Sidebar />
          <div className="overflow-x-hidden px-8 pb-4">
            <div className="sticky top-0 bg-white z-10 pb-4">
              <CategoryPills
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Usuarios (JSON)</h2>
              <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
                {usersJson}
              </pre>
            </div>

            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
              {videos.map((video) => (
                <VideoGridItem key={video.id} {...video} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
