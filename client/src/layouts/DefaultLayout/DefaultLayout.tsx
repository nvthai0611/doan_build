import "./DefaultLayout.scss";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { SidebarCenterQn } from "../../components/Sidebar/Sidebar-center-qn";
import { useState } from "react";
import { MobileBottomNav } from "../../components/Sidebar/MobileBottomNav";

const DefaultLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900">
      {/* Sidebar desktop */}
      <div className={`hidden md:block ${isSidebarCollapsed ? "w-16" : "w-64"} flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
        <SidebarCenterQn onToggleCollapse={setIsSidebarCollapsed} />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-3 sm:p-4 pb-24 md:pb-4">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>

      {/* Bottom nav cho mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default DefaultLayout;
