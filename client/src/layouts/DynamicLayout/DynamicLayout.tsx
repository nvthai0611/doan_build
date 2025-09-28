import { useAuth } from "../../lib/auth";
import { SidebarCenterQn } from "../../components/Sidebar/Sidebar-center-qn";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../DefaultLayout/Header";
import "./DynamicLayout.scss";

const DynamicLayout = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Chỉ hiển thị sidebar cho center_owner và teacher
  const shouldShowSidebar = user?.role === 'center_owner' || user?.role === 'teacher';

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900">
      {/* Sidebar - chỉ hiển thị cho center_owner và teacher */}
      {shouldShowSidebar && (
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <SidebarCenterQn onToggleCollapse={setIsSidebarCollapsed} />
        </div>
      )}

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - chỉ hiển thị cho center_owner và teacher */}
        {shouldShowSidebar && <Header />}
        
        <main className={`flex-1 overflow-auto ${shouldShowSidebar ? 'p-4' : 'p-0'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DynamicLayout;
