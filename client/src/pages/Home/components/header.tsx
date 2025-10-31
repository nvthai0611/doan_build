"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../../lib/auth"
import { Button } from "@/components/ui/button"
import { Menu, X, GraduationCap } from "lucide-react"

export const Header = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="gradient-bg p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline gradient-text font-bold">Quang Nguyễn Education</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#classes" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Lớp Học
            </a>
            <a href="#blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Blog
            </a>
            {/* <a href="#contribute" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Đóng Góp
            </a> */}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button variant="outline" asChild>
                <Link to="/dashboard">Bảng Điều Khiển</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/auth/login/family">Đăng Nhập</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:opacity-90 text-white border-0"
                >
                  <Link to="/auth/register/family">Đăng Ký</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            <a
              href="#classes"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              Lớp Học
            </a>
            <a
              href="#blog"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              Blog
            </a>
            <a
              href="#contribute"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              Đóng Góp
            </a>
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link to="/dashboard">Bảng Điều Khiển</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link to="/auth/login/family">Đăng Nhập</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:opacity-90 text-white border-0"
                  >
                    <Link to="/auth/register/family">Đăng Ký</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
