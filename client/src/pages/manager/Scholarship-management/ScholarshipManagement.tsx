'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScholarshipManageTab } from './components/ScholarshipManageTab'
import { AssignScholarshipTab } from './components/AssignScholarshipTab'

export default function ScholarshipManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý học bổng</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="crud" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="crud">Quản lý học bổng</TabsTrigger>
          <TabsTrigger value="assign">Cấp học bổng</TabsTrigger>
        </TabsList>

        <TabsContent value="crud" className="mt-0">
          <ScholarshipManageTab />
        </TabsContent>

        <TabsContent value="assign" className="mt-0">
          <AssignScholarshipTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
