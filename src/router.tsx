import { Navigate, createBrowserRouter } from "react-router-dom";
import GuestOnly from "./components/GuestOnly";

// Layouts
import AdminLayout from "./components/layouts/Admin";

// Pages
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/Login";
import AllRegistrations from "./pages/admin/registrations/All";
import PendingRegistrations from "./pages/admin/registrations/Pending";
import ApprovedRegistrations from "./pages/admin/registrations/Approved";
import RejectedRegistrations from "./pages/admin/registrations/Rejected";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/admin/login",
        element: <GuestOnly>
            <AdminLogin />
        </GuestOnly>
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="registrations" />
            },
            {
                path: "registrations",
                children: [
                    {
                        index: true,
                        element: <AllRegistrations />
                    },
                    {
                        path: "pending",
                        element: <PendingRegistrations />
                    },
                    {
                        path: "approved",
                        element: <ApprovedRegistrations />
                    },
                    {
                        path: "rejected",
                        element: <RejectedRegistrations />
                    },
                ]
            }
        ]
    }
]);
