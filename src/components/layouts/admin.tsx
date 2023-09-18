import { Outlet } from "react-router-dom";
import AuthOnly from "../authonly";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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
                        <Button variant="ghost" className="w-full justify-start">
                            All Entries
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Pending
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Approved
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Rejected
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Summary
                        </Button>
                    </div>
                </div>

                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Payment
                    </h2>

                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            All Entries
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Pending
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Paid
                        </Button>

                        <Button variant="ghost" className="w-full justify-start">
                            Unpaid
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
            <div className="grid lg:grid-cols-5 h-full">
                <Sidebar className="hidden lg:block h-screen" />
                <div className="col-span-3 lg:col-span-4 lg:border-l px-4">
                    <Outlet />
                </div>
            </div>
        </AuthOnly>
    );
}
