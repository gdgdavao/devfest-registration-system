import { createBrowserRouter } from "react-router-dom";
import GuestOnly from "./components/GuestOnly";

// Layouts
import AdminLayout from "./components/layouts/Admin";

// Pages
import Home from "./pages/Home/Home";
import AdminLogin from "./pages/admin/Login";
import AdminRegistrationEntries from "./pages/admin/Dashboard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/registration",
        element: <Home />,
        children: [],
    },
    {
        path: "/registration/profile",
        element: <Home homeRoute="profile" />,
        children: [],
    },
    {
        path: "/admin/login",
        element: (
            <GuestOnly>
                <AdminLogin />
            </GuestOnly>
        ),
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <AdminRegistrationEntries />,
            },
        ],
    },
]);
