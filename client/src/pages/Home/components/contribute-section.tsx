"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, FileText, Lightbulb, ArrowRight } from "lucide-react"

export const ContributeSection = () => {
  const contributions = [
    {
      icon: FileText,
      title: "Đăng Bài Viết",
      description: "Chia sẻ kinh nghiệm, mẹo học tập và những bài viết hữu ích cho cộng đồng",
      link: "/blog/create",
      color: "from-orange-500/20 to-orange-500/10",
      iconColor: "text-orange-600",
    },
    {
      icon: Lightbulb,
      title: "Đề Xuất Khóa Học",
      description: "Gợi ý những khóa học mới hoặc cải thiện các khóa học hiện có",
      link: "/suggestions/create",
      color: "from-pink-500/20 to-pink-500/10",
      iconColor: "text-pink-600",
    },
    {
      icon: Users,
      title: "Trở Thành Giáo Viên",
      description: "Tham gia đội ngũ giáo viên và chia sẻ kiến thức của bạn với học sinh",
      link: "/auth/register/teacher",
      color: "from-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-600",
    },
  ]

  return (
    <section id="contribute" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-medium gradient-text">Cộng Đồng</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Đóng Góp Cho Cộng Đồng</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bạn có kinh nghiệm muốn chia sẻ? Hãy trở thành một phần của cộng đồng giáo dục của chúng tôi
          </p>
        </div>

        {/* Contribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contributions.map((item, idx) => {
            const Icon = item.icon
            return (
              <Card
                key={idx}
                className="hover:shadow-lg transition-all duration-300 flex flex-col border-t-4 border-t-orange-500 hover:border-t-purple-500 hover:-translate-y-1"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start gradient-text hover:bg-gradient-to-r hover:from-orange-500/10 hover:via-pink-500/10 hover:to-purple-500/10"
                  >
                    <Link to={item.link}>
                      Bắt Đầu
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
