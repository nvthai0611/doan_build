"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authService } from '../../services/common/auth/auth.service'

interface PermissionTestProps {
  userRole?: string
  userPermissions?: string[]
}

export function PermissionTest({ userRole, userPermissions = [] }: PermissionTestProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [apiPermissions, setApiPermissions] = useState<string[]>([])

  const runDatabasePermissionTest = async () => {
    setIsLoading(true)
    setTestResults(null)
    
    try {
      console.log("=== DATABASE PERMISSION TEST ===")
      
      // Test get user permissions from API
      console.log("Testing API: getUserPermissions...")
      const permissions = await authService.getUserPermissions()
      setApiPermissions(permissions)
      console.log("API Permissions:", permissions)
      
      // Test specific permissions
      const testCases = [
        { name: "students.view", expected: true, description: "View Students" },
        { name: "students.create", expected: false, description: "Create Students" },
        { name: "teachers.view", expected: true, description: "View Teachers" },
        { name: "teachers.create", expected: false, description: "Create Teachers" },
        { name: "courses.view", expected: true, description: "View Courses" },
        { name: "courses.create", expected: false, description: "Create Courses" },
        { name: "schedule.view", expected: true, description: "View Schedule" },
        { name: "schedule.create", expected: false, description: "Create Schedule" },
        { name: "finance.create", expected: false, description: "Manage Finance" },
        { name: "users.create", expected: false, description: "Manage Users" }
      ]
      
      const results = []
      
      for (const testCase of testCases) {
        try {
          const hasPermission = await authService.checkPermission(testCase.name)
          const isCorrect = hasPermission === testCase.expected
          
          results.push({
            ...testCase,
            actual: hasPermission,
            correct: isCorrect
          })
          
          console.log(`${isCorrect ? "✅" : "❌"} ${testCase.description}: ${hasPermission} (expected: ${testCase.expected})`)
        } catch (error) {
          console.error(`Error testing ${testCase.name}:`, error)
          results.push({
            ...testCase,
            actual: false,
            correct: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
      
      const correctCount = results.filter(r => r.correct).length
      const totalCount = results.length
      
      setTestResults({
        results,
        correctCount,
        totalCount,
        successRate: Math.round((correctCount / totalCount) * 100)
      })
      
      console.log(`=== TEST SUMMARY ===`)
      console.log(`Correct: ${correctCount}/${totalCount} (${Math.round((correctCount / totalCount) * 100)}%)`)
      
    } catch (error) {
      console.error("Database permission test failed:", error)
      setTestResults({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAllRoles = async () => {
    setIsLoading(true)
    try {
      console.log("=== TESTING ALL ROLES ===")
      
      const roles = await authService.getAllRoles()
      console.log("Available roles:", roles)
      
      const permissions = await authService.getAllPermissions()
      console.log("Available permissions:", permissions)
      
      alert(`Found ${roles.length} roles and ${permissions.length} permissions in database!`)
      
    } catch (error) {
      console.error("Error testing all roles:", error)
      alert("Error loading roles and permissions from database")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Kiểm tra quyền hạn từ Database
            <Badge variant="outline">{userRole || "Vai trò không xác định"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Quyền hạn Frontend</h4>
              <p className="text-sm text-blue-700">
                {userPermissions.length} quyền hạn đã tải
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {userPermissions.slice(0, 5).map((perm, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>
                ))}
                {userPermissions.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{userPermissions.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Quyền hạn từ API</h4>
              <p className="text-sm text-green-700">
                {apiPermissions.length} quyền hạn từ API
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {apiPermissions.slice(0, 5).map((perm, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>
                ))}
                {apiPermissions.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{apiPermissions.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={runDatabasePermissionTest}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Đang kiểm tra..." : "Kiểm tra quyền hạn Database"}
            </Button>
            
            <Button 
              onClick={testAllRoles}
              disabled={isLoading}
              variant="outline"
            >
              Kiểm tra tất cả vai trò & quyền hạn
            </Button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="mt-4">
              {testResults.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900">Kiểm tra thất bại</h4>
                  <p className="text-sm text-red-700">{testResults.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Kết quả kiểm tra</h4>
                    <p className="text-sm text-gray-700">
                      {testResults.correctCount}/{testResults.totalCount} bài kiểm tra đạt ({testResults.successRate}%)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {testResults.results.map((result: any, index: number) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded text-xs ${
                          result.correct 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{result.correct ? "✅" : "❌"}</span>
                          <span className="font-medium">{result.description}</span>
                        </div>
                        <div className="text-xs opacity-75">
                          Mong đợi: {result.expected ? "có" : "không"}, Nhận được: {result.actual ? "có" : "không"}
                        </div>
                        {result.error && (
                          <div className="text-xs text-red-600 mt-1">
                            Lỗi: {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
