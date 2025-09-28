"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { usePermissions } from '../../hooks/use-permission'
import { PermissionTest } from '../../components/PermissionTest/PermissionTest'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService } from '../../services/common/auth/auth.service'

export default function PermissionTestPage() {
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole, userPermissions } = usePermissions()
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [allPermissions, setAllPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadDatabaseData()
  }, [])

  const loadDatabaseData = async () => {
    setIsLoading(true)
    try {
      const [roles, permissions] = await Promise.all([
        authService.getAllRoles(),
        authService.getAllPermissions()
      ])
      setAllRoles(roles)
      setAllPermissions(permissions)
    } catch (error) {
      console.error("Error loading database data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testAllRolePermissions = async () => {
    setIsLoading(true)
    try {
      console.log("=== TESTING ALL ROLES AND PERMISSIONS ===")
      
      for (const role of allRoles) {
        console.log(`\n--- Testing Role: ${role.displayName} (${role.name}) ---`)
        console.log(`Permissions: ${role.permissions.length}`)
        
        role.permissions.forEach((perm: any) => {
          console.log(`  - ${perm.name}: ${perm.displayName}`)
        })
      }
      
      console.log(`\n--- All Permissions (${allPermissions.length}) ---`)
      allPermissions.forEach((perm: any) => {
        console.log(`  - ${perm.name}: ${perm.displayName} (${perm.module}.${perm.action})`)
      })
      
      alert(`Database loaded successfully!\n\nRoles: ${allRoles.length}\nPermissions: ${allPermissions.length}\n\nCheck console for details.`)
      
    } catch (error) {
      console.error("Error testing all roles:", error)
      alert("Error testing roles and permissions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Database Permission Test</h1>
        <p className="text-muted-foreground">
          Test hệ thống permission với database - Role: {userRole}
        </p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">User Details</h4>
              <p className="text-sm text-blue-700">Role: {userRole}</p>
              <p className="text-sm text-blue-700">Email: {user?.email}</p>
              <p className="text-sm text-blue-700">Name: {user?.fullName}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Frontend Permissions</h4>
              <p className="text-sm text-green-700">{userPermissions.length} permissions</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {userPermissions.slice(0, 3).map((perm, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>
                ))}
                {userPermissions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{userPermissions.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Database Status</h4>
              <p className="text-sm text-purple-700">Roles: {allRoles.length}</p>
              <p className="text-sm text-purple-700">Permissions: {allPermissions.length}</p>
              <Button 
                onClick={loadDatabaseData}
                disabled={isLoading}
                size="sm"
                className="mt-2"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Test Component */}
      <PermissionTest 
        userRole={userRole} 
        userPermissions={userPermissions} 
      />

      {/* Database Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Database Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testAllRolePermissions}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Testing..." : "Test All Roles & Permissions"}
            </Button>
          </div>

          {/* Roles List */}
          <div>
            <h4 className="font-medium mb-2">Available Roles ({allRoles.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {allRoles.map((role) => (
                <div key={role.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{role.displayName}</h5>
                      <p className="text-sm text-gray-600">{role.name}</p>
                    </div>
                    <Badge variant="outline">
                      {role.permissions.length} perms
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions by Module */}
          <div>
            <h4 className="font-medium mb-2">Permissions by Module</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(
                allPermissions.reduce((acc, perm) => {
                  if (!acc[perm.module]) acc[perm.module] = []
                  acc[perm.module].push(perm)
                  return acc
                }, {} as Record<string, any[]>)
              ).map(([module, permissions]) => (
                <div key={module} className="p-3 border rounded-lg">
                  <h5 className="font-medium capitalize">{module}</h5>
                  <p className="text-sm text-gray-600">{(permissions as any[]).length} permissions</p>
                  <div className="mt-2 space-y-1">
                    {(permissions as any[]).slice(0, 3).map((perm: any) => (
                      <div key={perm.id} className="text-xs text-gray-500">
                        {perm.name}
                      </div>
                    ))}
                    {(permissions as any[]).length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{(permissions as any[]).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
