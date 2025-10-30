"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles } from "lucide-react"

export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 gradient-bg opacity-90"></div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Khơi nguồn tri thức</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Nơi Bắt Đầu Hành Trình Học Tập
            </h1>

            <p className="text-lg text-white/90 max-w-xl">
              Tìm kiếm lớp học chất lượng cao với giáo viên giàu kinh nghiệm. Phát triển kỹ năng, mở rộng kiến thức, xây
              dựng tương lai tươi sáng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild className="text-base bg-white text-orange-500 hover:bg-white/90 font-semibold">
                <Link to="/auth/register/family">
                  Đăng Ký Ngay
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <a href="#classes">Khám Phá Lớp Học</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-white/80">Lớp Học</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm text-white/80">Học Sinh</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-sm text-white/80">Giáo Viên</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="h-3 bg-white/30 rounded-full w-3/4"></div>
                  <div className="h-3 bg-white/20 rounded-full w-full"></div>
                  <div className="h-3 bg-white/20 rounded-full w-5/6"></div>
                  <div className="pt-4 space-y-3">
                    <div className="h-12 bg-white/20 rounded-lg"></div>
                    <div className="h-12 bg-white/20 rounded-lg"></div>
                    <div className="h-12 bg-white/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
