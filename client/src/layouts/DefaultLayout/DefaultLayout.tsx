import "./DefaultLayout.scss";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { SidebarCenterQn } from "../../components/Sidebar/Sidebar-center-qn";

const DefaultLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar cố định bên trái */}
      <div className="w-64 flex-shrink-0 border-r">
        <SidebarCenterQn />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
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
