"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, ArrowRight } from "lucide-react"

export const BlogSection = () => {
  const blogs = [
    {
      id: 1,
      title: "Mẹo Học Tập Hiệu Quả Cho Học Sinh Cấp 2",
      excerpt: "Khám phá những phương pháp học tập khoa học giúp tăng hiệu suất học tập...",
      category: "Học Tập",
      date: "15 Tháng 10, 2024",
      author: "Thầy Nguyễn Văn A",
    },
    {
      id: 2,
      title: "Cách Chuẩn Bị Cho Kỳ Thi Đại Học",
      excerpt: "Lộ trình ôn tập toàn diện và chiến lược làm bài thi hiệu quả...",
      category: "Thi Cử",
      date: "12 Tháng 10, 2024",
      author: "Cô Trần Thị B",
    },
    {
      id: 3,
      title: "Phát Triển Kỹ Năng Mềm Cho Trẻ Em",
      excerpt: "Tầm quan trọng của kỹ năng giao tiếp, lãnh đạo và làm việc nhóm...",
      category: "Kỹ Năng",
      date: "10 Tháng 10, 2024",
      author: "Thầy Lê Văn C",
    },
  ]

  return (
    <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-4 h-4 gradient-text" />
            <span className="text-sm font-medium gradient-text">Blog & Kiến Thức</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Bài Viết Mới Nhất</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chia sẻ kinh nghiệm, mẹo học tập và những câu chuyện thành công từ giáo viên và học sinh
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="hover:shadow-lg transition-shadow duration-300 flex flex-col border-l-4 border-l-orange-500 hover:border-l-purple-500"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-600 border-orange-200"
                  >
                    {blog.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 flex-1">{blog.excerpt}</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Tác giả: {blog.author}</p>
                  <p>{blog.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/blog">
              Xem Tất Cả Bài Viết
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:opacity-90 text-white border-0"
          >
            <Link to="/blog/create">
              <Plus className="mr-2 w-4 h-4" />
              Viết Bài Mới
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
