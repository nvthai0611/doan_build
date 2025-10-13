"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, BookOpen, Clock, Users, Star } from "lucide-react"

interface ExercisesInfoProps {
  classId: string
}

export default function ExercisesInfo({ classId }: ExercisesInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "grammar" | "vocabulary" | "listening" | "speaking">("all")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const exercises = [
    {
      id: "1",
      title: "Bài tập ngữ pháp: Thì hiện tại đơn",
      description: "Luyện tập cách sử dụng thì hiện tại đơn trong câu",
      type: "grammar",
      difficulty: "easy",
      estimatedTime: "15 phút",
      attempts: 25,
      averageScore: 85,
      totalQuestions: 10,
      createdBy: "Nguyễn Thị Lan",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      title: "Từ vựng chủ đề gia đình",
      description: "Học và luyện tập từ vựng về các thành viên trong gia đình",
      type: "vocabulary",
      difficulty: "medium",
      estimatedTime: "20 phút",
      attempts: 18,
      averageScore: 78,
      totalQuestions: 15,
      createdBy: "Nguyễn Thị Lan",
      createdAt: "2024-01-16"
    },
    {
      id: "3",
      title: "Luyện nghe: Đoạn hội thoại cơ bản",
      description: "Nghe và trả lời câu hỏi về đoạn hội thoại",
      type: "listening",
      difficulty: "medium",
      estimatedTime: "25 phút",
      attempts: 12,
      averageScore: 72,
      totalQuestions: 8,
      createdBy: "Nguyễn Thị Lan",
      createdAt: "2024-01-17"
    },
    {
      id: "4",
      title: "Thực hành phát âm: Nguyên âm",
      description: "Luyện tập phát âm các nguyên âm trong tiếng Anh",
      type: "speaking",
      difficulty: "easy",
      estimatedTime: "10 phút",
      attempts: 30,
      averageScore: 88,
      totalQuestions: 5,
      createdBy: "Nguyễn Thị Lan",
      createdAt: "2024-01-18"
    }
  ]

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    return matchesSearch && exercise.type === activeTab
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "grammar":
        return <Badge className="bg-blue-100 text-blue-800">Ngữ pháp</Badge>
      case "vocabulary":
        return <Badge className="bg-green-100 text-green-800">Từ vựng</Badge>
      case "listening":
        return <Badge className="bg-purple-100 text-purple-800">Nghe</Badge>
      case "speaking":
        return <Badge className="bg-orange-100 text-orange-800">Nói</Badge>
      default:
        return <Badge variant="secondary">Khác</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge className="bg-green-100 text-green-800">Dễ</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>
      case "hard":
        return <Badge className="bg-red-100 text-red-800">Khó</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bài tập</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý bài tập và bài kiểm tra trực tuyến
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài tập
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm bài tập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Tất cả ({exercises.length})
              </button>
              <button
                onClick={() => setActiveTab("grammar")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "grammar"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Ngữ pháp ({exercises.filter(e => e.type === "grammar").length})
              </button>
              <button
                onClick={() => setActiveTab("vocabulary")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "vocabulary"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Từ vựng ({exercises.filter(e => e.type === "vocabulary").length})
              </button>
              <button
                onClick={() => setActiveTab("listening")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "listening"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Nghe ({exercises.filter(e => e.type === "listening").length})
              </button>
              <button
                onClick={() => setActiveTab("speaking")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "speaking"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Nói ({exercises.filter(e => e.type === "speaking").length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài tập ({filteredExercises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      {exercise.totalQuestions} câu
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {exercise.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {exercise.estimatedTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {exercise.attempts} lượt làm
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Điểm TB: {exercise.averageScore}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Tạo bởi: {exercise.createdBy} • {new Date(exercise.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-2">
                    {getTypeBadge(exercise.type)}
                    {getDifficultyBadge(exercise.difficulty)}
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có bài tập nào</p>
                  <p className="text-sm">Tạo bài tập đầu tiên cho lớp học</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
