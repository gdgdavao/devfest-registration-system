import { Link, Outlet, useNavigate } from "react-router-dom";
import AuthOnly from "../AuthOnly";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import IconAll from "~icons/material-symbols/format-list-bulleted";
import IconPending from "~icons/material-symbols/pending-outline";
import IconApprove from "~icons/material-symbols/check-circle-outline";
import IconReject from "~icons/material-symbols/cancel-outline";
import IconSummary from "~icons/material-symbols/browse-activity-outline-rounded";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { pb } from "@/client";
import { AdminModel } from "pocketbase";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import useTailwindBreakpoint from "@/lib/tailwind_breakpoint";

interface NavSection {
  name: string;
  entries: NavEntry[];
}

interface NavEntry {
  path: string;
  label: string;
  icon: (props: Record<string, never>) => JSX.Element;
}

const navSections: NavSection[] = [
  {
    name: "Registration",
    entries: [
      {
        path: "/registrations",
        icon: IconAll,
        label: "All Entries",
      },
      {
        path: "/registrations/pending",
        icon: IconPending,
        label: "Pending",
      },
      {
        path: "/registrations/approved",
        icon: IconApprove,
        label: "Approved",
      },
      {
        path: "/registrations/rejected",
        icon: IconReject,
        label: "Rejected",
      },
      {
        path: "/registrations/summary",
        icon: IconSummary,
        label: "Summary",
      },
    ],
  },
  {
    name: "Payment",
    entries: [
      {
        path: "/payments",
        icon: IconAll,
        label: "All Entries",
      },
    ],
  },
  {
    name: "Merch Sensing",
    entries: [
      {
        path: "/merch_sensing",
        icon: IconAll,
        label: "All Entries",
      },
      {
        path: "/merch_sensing/summary",
        icon: IconSummary,
        label: "Summary",
      },
    ],
  },
];

function Sidebar({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const currentUser = pb.authStore.model as AdminModel;
  const navigate = useNavigate();

  return (
    <div className={cn("bg-white border-r pb-12", className)}>
      <div className="h-full flex flex-col">
        <div className="px-3 pt-6 pb-4">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            DevFest Registration System
          </h2>
        </div>

        {navSections.map((section) => (
          <div key={`nav_section_${section.name}`} className="px-3 py-4">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {section.name}
            </h2>

            <div className="space-y-1">
              {section.entries.map((e, idx) => (
                <Button
                  key={`nav_${section.name}_${idx}`}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link onClick={() => onClick?.()} to={"/admin" + e.path}>
                    <span className="inline-block mr-2">
                      <e.icon />
                    </span>
                    {e.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-auto px-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full cursor-pointer hover:bg-secondary transition-colors px-2 py-2">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>
                    {currentUser.email[0] + currentUser.email[1]}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm">{currentUser.email}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  pb.authStore.clear();
                  navigate("/admin/login");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const breakpoint = useTailwindBreakpoint();
  const [isOpen, setIsOpen] = useState(true);
  const [shouldMenuClose, setMenuClose] = useState(false);

  useEffect(() => {
    if (!breakpoint) return;

    if (breakpoint === "md" || breakpoint.endsWith("xl")) {
      setIsOpen(true);
      setMenuClose(false);
    } else if (["xs", "sm", "md"].includes(breakpoint)) {
      setIsOpen(false);
      setMenuClose(true);
    }
  }, [breakpoint]);

  return (
    <AuthOnly>
      <div
        className={cn(
          "fixed left-0 inset-y-0 z-50 h-screen transition-transform",
          [!isOpen ? "-translate-x-80 md:-translate-x-64" : "translate-x-0"]
        )}
      >
        <Sidebar
          onClick={() => setIsOpen(!shouldMenuClose)}
          className="h-screen w-80 md:w-64"
        />

        <Button
          variant="secondary"
          onClick={() => setIsOpen((o) => !o)}
          className="absolute top-0 left-80 md:left-64 m-4"
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>
      <div
        className={cn("relative pt-20 pb-48 px-4 transition-[margin]", [
          isOpen ? "lg:ml-64" : "lg:ml-0",
        ])}
      >
        <div className="w-full max-w-5xl mx-auto">
          <Outlet />
        </div>
      </div>
    </AuthOnly>
  );
}
