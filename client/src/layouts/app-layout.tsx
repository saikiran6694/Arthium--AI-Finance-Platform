import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/sidebar";
import EditTransactionDrawer from "@/components/transaction/edit-transaction-drawer";
import { cn } from "@/lib/utils";
import { SIDEBAR_KEY } from "@/constant";


const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />

        <main
          className={cn(
            "flex-1 overflow-y-auto min-h-screen",
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-[64px]" : "ml-[220px]"
          )}
        >
          <Outlet />
        </main>
      </div>
      <EditTransactionDrawer />
    </>
  );
};

export default AppLayout;