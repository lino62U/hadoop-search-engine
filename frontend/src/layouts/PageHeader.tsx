import { ArrowLeft, Bell, Menu, Mic, Search, Upload, User } from "lucide-react"
import logo from "/src/assets/logo.png"
import { Button } from "../components/Button"
import { useState } from "react"
import { useSidebarContext } from "../contexts/useSidebarContext"
import { useNavigate } from "react-router-dom"
//import { useSidebarContext } from "../contexts/useSidebarContext"
export function PageHeader() {
  const [showFullWidthSearch, setShowFullWidthSearch] = useState(false)
  const [search, setSearch] = useState<string>("")
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim() !== "") {
      const searchParams = new URLSearchParams()
      // Para soportar múltiples términos separados por espacios
      search.trim().split(/\s+/).forEach(word => searchParams.append("q", word))
      navigate(`/search?${searchParams.toString()}`)
    }
  }

  return (
    <div className="flex gap-10 lg:gap-20 justify-between pt-2 mb-6 mx-4">
      <PageHeaderFirstSection hidden={showFullWidthSearch} />
      <form
        onSubmit={handleSearchSubmit}
        className={`gap-4 flex-grow justify-center ${showFullWidthSearch ? "flex" : "hidden md:flex"
          }`}
      >
        {showFullWidthSearch && (
          <Button
            onClick={() => setShowFullWidthSearch(false)}
            type="button"
            size="icon"
            variant="ghost"
            className="flex-shrink-0"
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="flex flex-grow max-w-[600px]">
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-l-full border border-secondary-border shadow-inner shadow-secondary py-1 px-4 text-lg w-full focus:border-blue-500 outline-none"
          />
          <Button
            type="submit"
            className="py-2 px-4 rounded-r-full border-secondary-border border border-l-0 flex-shrink-0"
          >
            <Search />
          </Button>
        </div>
        <Button type="button" size="icon" className="flex-shrink-0">
          <Mic />
        </Button>
      </form>

      {/* Íconos a la derecha */}
      <div
        className={`flex-shrink-0 md:gap-2 ${showFullWidthSearch ? "hidden" : "flex"
          }`}
      >
        <Button
          onClick={() => setShowFullWidthSearch(true)}
          size="icon"
          variant="ghost"
          className="md:hidden"
        >
          <Search />
        </Button>
        <Button size="icon" variant="ghost" className="md:hidden">
          <Mic />
        </Button>

        <Button size="icon" variant="ghost">
          <Upload />
        </Button>
        <Button size="icon" variant="ghost">
          <Bell />
        </Button>
        <Button size="icon" variant="ghost">
          <User />
        </Button>
      </div>
    </div>
  )
}

type PageHeaderFirstSectionProps = {
  hidden?: boolean
}

export function PageHeaderFirstSection({
  hidden = false,
}: PageHeaderFirstSectionProps) {
  const { toggle } = useSidebarContext()

  return (
    <div
      className={`gap-4 items-center flex-shrink-0 ${hidden ? "hidden" : "flex"
        }`}
    >
      <Button onClick={toggle} variant="ghost" size="icon">
        <Menu />
      </Button>
      <a href="/">
        <img src={logo} className="h-6" />
      </a>
    </div>
  )
}