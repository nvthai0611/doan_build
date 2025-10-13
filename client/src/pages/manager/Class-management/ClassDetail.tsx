'use client';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/Loading/LoadingPage';
import GeneralInfo from './components/GeneralInfo';
import StudentsInfo from './components/StudentsInfo';
import TeachersInfo from './components/TeachersInfo';
import LessonsInfo from './components/LessonsInfo';
import AssignmentsInfo from './components/AssignmentsInfo';
import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

export default function ClassDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const classId = params.id as string;

  const [activeTab, setActiveTab] = useState('general');

  // Mock data - sẽ được thay thế bằng data thật từ API
  const classData = {
    id: classId,
    name: 'TINY EXPLORERS 1',
    code: 'TIXP1',
    course: 'TINY EXPLORERS',
    room: 'P1',
    startDate: '',
    endDate: '',
    status: 'Chưa cập nhật',
    description: '',
    schedule: [
      { day: 'Thứ Ba', time: '19:45 -> 21:15' },
      { day: 'Thứ Năm', time: '19:45 -> 21:15' },
    ],
  };

  const isLoading = false;
  const error = null;

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lỗi tải dữ liệu
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Không thể tải thông tin lớp học
          </p>
          <button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'general', label: 'Thông tin chung' },
    { key: 'students', label: 'Học viên' },
    { key: 'teachers', label: 'Giáo viên' },
    { key: 'lessons', label: 'Buổi học' },
    { key: 'assignments', label: 'Công việc' },
    { key: 'exercises', label: 'Bài tập' },
    { key: 'documents', label: 'Tài liệu' },
    { key: 'grades', label: 'Đánh giá' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralInfo classData={classData} />;
      case 'students':
        return <StudentsInfo classId={classId} />;
      case 'teachers':
        return <TeachersInfo classId={classId} />;
      case 'lessons':
        return <LessonsInfo classId={classId} />;
      case 'assignments':
        return <AssignmentsInfo classId={classId} />;
      //   case "exercises":
      //     return <ExercisesInfo classId={classId} />
      //   case "documents":
      //     return <DocumentsInfo classId={classId} />
      //   case "grades":
      //     return <GradesInfo classId={classId} />
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        {/* Breadcrumbs */}
        <div className="space-y-2">
          <h1 className="text-2xl  font-semibold text-foreground">
            Danh sách lớp học
          </h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/center-qn"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/center-qn/classes"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Danh sách lớp học
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Chi tiết lớp học
                </BreadcrumbPage>
              </BreadcrumbItem> 
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  );
}
