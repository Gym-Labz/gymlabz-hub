import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 w-full">
          <div className="px-4 py-6 max-w-7xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
