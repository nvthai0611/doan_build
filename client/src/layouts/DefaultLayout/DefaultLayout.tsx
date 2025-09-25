import "./DefaultLayout.scss";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { SidebarCenterQn } from "../../components/Sidebar/Sidebar-center-qn";
import { useState } from "react";

const DefaultLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar responsive */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r transition-all duration-300`}>
        <SidebarCenterQn onToggleCollapse={setIsSidebarCollapsed} />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default DefaultLayout;
