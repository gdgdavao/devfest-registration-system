import { Link, Outlet } from "react-router-dom";
import AuthOnly from "../AuthOnly";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import IconAll from '~icons/material-symbols/format-list-bulleted';
import IconPending from '~icons/material-symbols/pending-outline';
import IconApprove from '~icons/material-symbols/check-circle-outline';
import IconReject from '~icons/material-symbols/cancel-outline';
import IconSummary from '~icons/material-symbols/browse-activity-outline-rounded';

function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        DevFest Registration System
                    </h2>
                </div>

                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Registration
                    </h2>

                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/registrations">
                                <IconAll className="mr-2" />
                                All Entries
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/registrations/pending">
                                <IconPending className="mr-2" />
                                Pending
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/registrations/approved">
                                <IconApprove className="mr-2" />
                                Approved
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/registrations/rejected">
                                <IconReject className="mr-2" />
                                Rejected
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/registrations/summary">
                                <IconSummary className="mr-2" />
                                Summary
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Payment
                    </h2>

                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/payments">
                                <IconAll className="mr-2" />
                                All Entries
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/payments/pending">
                                <IconPending className="mr-2" />
                                Pending
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/payments/paid">
                                <IconApprove className="mr-2" />
                                Paid
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/payments/unpaid">
                                <IconReject className="mr-2" />
                                Unpaid
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Merch Sensing
                    </h2>

                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin/merch_sensing/summary">
                                <IconSummary className="mr-2" />
                                Summary
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminLayout() {
    return (
        <AuthOnly>
            <div className="grid lg:grid-cols-5 xl:grid-cols-8 h-full">
                <Sidebar className="hidden lg:block h-screen" />
                <div className="col-span-3 lg:col-span-4 xl:col-span-7 lg:border-l px-4">
                    <Outlet />
                </div>
            </div>
        </AuthOnly>
    );
}
