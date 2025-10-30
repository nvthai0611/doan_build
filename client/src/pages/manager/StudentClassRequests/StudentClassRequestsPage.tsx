import React, { useState } from 'react';
import { StudentClassRequestsTable } from './StudentClassRequestsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StudentClassRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Yêu cầu tham gia lớp học
        </h1>
        <p className="text-gray-500 mt-2">
          Quản lý các yêu cầu tham gia lớp học từ phụ huynh
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã chấp nhận</TabsTrigger>
          <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <StudentClassRequestsTable />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <StudentClassRequestsTable filterStatus="pending" />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <StudentClassRequestsTable filterStatus="approved" />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <StudentClassRequestsTable filterStatus="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentClassRequestsPage;

