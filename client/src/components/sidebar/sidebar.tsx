import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart2,
  Settings,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  BotMessageSquare,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LogoutDialog from "../navbar/logout-dialog";
import { useTypedSelector } from "@/app/hook";
import { GalleryVerticalEnd } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const NAV_ROUTES = [
  {
    href: PROTECTED_ROUTES.OVERVIEW,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: PROTECTED_ROUTES.TRANSACTIONS,
    label: "Transactions",
    icon: ArrowLeftRight,
  },
  {
    href: PROTECTED_ROUTES.REPORTS,
    label: "Reports",
    icon: BarChart2,
  },
  {
    href: PROTECTED_ROUTES.AI_CHAT,
    label: "AI Assistant",
    icon: BotMessageSquare,
  },
  {
    href: PROTECTED_ROUTES.SETTINGS,
    label: "Settings",
    icon: Settings,
  },
];

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { pathname } = useLocation();
  const { user } = useTypedSelector((state) => state.auth);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col",
          "bg-[var(--secondary-dark-color)] text-white",
          "border-r border-white/8",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[64px]" : "w-[220px]"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 px-3 border-b border-white/8 shrink-0",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <NavLink
              to={PROTECTED_ROUTES.OVERVIEW}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="bg-green-500 text-white h-6.5 w-6.5 rounded flex items-center justify-center shrink-0">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <span className="font-semibold text-lg truncate">Arthium</span>
            </NavLink>
          )}

          {isCollapsed && (
            <NavLink
              to={PROTECTED_ROUTES.OVERVIEW}
              className="flex items-center justify-center"
              title="Arthium"
            >
              <div className="bg-green-500 text-white h-6.5 w-6.5 rounded flex items-center justify-center">
                <GalleryVerticalEnd className="size-4" />
              </div>
            </NavLink>
          )}

          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10",
              "transition-colors duration-150 cursor-pointer shrink-0",
              isCollapsed && "absolute -right-3 top-5 bg-[var(--secondary-dark-color)] border border-white/15 shadow-md rounded-full p-1"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-hidden">
          {NAV_ROUTES.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
            return (
              <div key={route.href} className="relative group">
                <NavLink
                  to={route.href}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2.5 rounded-md w-full",
                    "text-sm font-medium transition-colors duration-150",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/55 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-green-400" : "text-white/55 group-hover:text-white/80",
                      "w-[18px] h-[18px]"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{route.label}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <ChevronRight className="ml-auto w-3.5 h-3.5 text-white/30 shrink-0" />
                  )}
                </NavLink>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div
                    className={cn(
                      "absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50",
                      "px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                      "bg-gray-900 text-white shadow-lg border border-white/10",
                      "pointer-events-none opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-150"
                    )}
                  >
                    {route.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom: User Profile */}
        <div className="shrink-0 border-t border-white/8 p-2">
          <div className="relative group">
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className={cn(
                "flex items-center w-full rounded-md px-2.5 py-2.5",
                "text-white/55 hover:bg-white/8 hover:text-white",
                "transition-colors duration-150 cursor-pointer",
                isCollapsed ? "justify-center" : "gap-3"
              )}
              aria-label="Logout"
            >
              <Avatar className="h-7 w-7 shrink-0">
                {user?.profile_picture && (
                  <AvatarImage src={user.profile_picture} />
                )}
                <AvatarFallback className="bg-white/15 text-white text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium text-white/80 truncate flex-1 text-left">
                    {user?.name || "User"}
                  </span>
                  <LogOut className="w-3.5 h-3.5 text-white/40 shrink-0" />
                </>
              )}
            </button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div
                className={cn(
                  "absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50",
                  "px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                  "bg-gray-900 text-white shadow-lg border border-white/10",
                  "pointer-events-none opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-150"
                )}
              >
                {user?.name || "User"} · Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>
        </div>
      </aside>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        setIsOpen={setIsLogoutDialogOpen}
      />
    </>
  );
};

export default Sidebar;