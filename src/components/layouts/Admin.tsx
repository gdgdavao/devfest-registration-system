import { Link, Outlet } from "react-router-dom";
import AuthOnly from "../AuthOnly";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import IconAll from '~icons/material-symbols/format-list-bulleted';
import IconPending from '~icons/material-symbols/pending-outline';
import IconApprove from '~icons/material-symbols/check-circle-outline';
import IconReject from '~icons/material-symbols/cancel-outline';
import IconSummary from '~icons/material-symbols/browse-activity-outline-rounded';
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavSection {
    name: string
    entries: NavEntry[]
}

interface NavEntry {
    path: string
    label: string
    icon: (props: Record<string, never>) => JSX.Element
}

const navSections: NavSection[] = [
    {
        name: 'Registration',
        entries: [
            {
                path: '/registration',
                icon: IconAll,
                label: 'All Entries'
            },
            {
                path: '/registrations/pending',
                icon: IconPending,
                label: 'Pending'
            },
            {
                path: '/registrations/approved',
                icon: IconApprove,
                label: 'Approved'
            },
            {
                path: '/registrations/rejected',
                icon: IconReject,
                label: 'Rejected'
            },
            {
                path: '/registrations/summary',
                icon: IconSummary,
                label: 'Summary'
            },
        ]
    },
    {
        name: 'Payment',
        entries: [
            {
                path: '/payments',
                icon: IconAll,
                label: 'All Entries'
            },
        ]
    },
    {
        name: 'Merch Sensing',
        entries: [
            {
                path: '/merch_sensing',
                icon: IconAll,
                label: 'All Entries'
            },
            {
                path: '/merch_sensing/summary',
                icon: IconSummary,
                label: 'All Entries'
            },
        ]
    },
];

function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("bg-white border-r pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        DevFest Registration System
                    </h2>
                </div>

                {navSections.map(section => (
                    <div key={`nav_section_${section.name}`} className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            {section.name}
                        </h2>

                        <div className="space-y-1">
                            {section.entries.map((e, idx) => (
                                <Button
                                    key={`nav_${section.name}_${idx}`}
                                    variant="ghost"
                                    className="w-full justify-start" asChild>
                                    <Link to={"/admin" + e.path}>
                                        <span className="inline-block mr-2"><e.icon /></span>
                                        {e.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function AdminLayout() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <AuthOnly>
            <div className={cn('fixed left-0 inset-y-0 z-50 h-screen transition-transform', [!isOpen ? '-translate-x-64' : 'translate-x-0'])}>
                <Sidebar className="h-screen w-64" />

                <Button variant="secondary" onClick={() => setIsOpen(o => !o)} className="absolute top-0 left-64 m-4 w-36">
                    {isOpen ? <X className="mr-2" /> : <Menu className="mr-2" />}
                    {isOpen ? 'Close' : 'Open Menu'}
                </Button>
            </div>
            <div className={cn("relative pt-20 pb-48 px-4 transition-[margin]", [isOpen ? 'md:ml-64' : 'md:ml-0'])}>
                <div className="w-full max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </AuthOnly>
    );
}
