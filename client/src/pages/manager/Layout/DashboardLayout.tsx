"use client"

import type React from "react"

import { useAuth } from "../../../lib/auth"
import { Sidebar } from "./Sidebar"
import { LoginForm } from "../../Auth/Login"
import { Loader2 } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
