import { createBrowserRouter } from "react-router-dom";
import GuestOnly from "./components/guestonly";

// Layouts
import AdminLayout from "./components/layouts/admin";

// Pages
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

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
                element: <AdminDashboard />
            }
        ]
    }
]);
