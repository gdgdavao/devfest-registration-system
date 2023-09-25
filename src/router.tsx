import { Navigate, createBrowserRouter } from "react-router-dom";
import GuestOnly from "./components/GuestOnly";

// Layouts
import AdminLayout from "./components/layouts/Admin";

// Pages
import AdminLogin from "./pages/admin/Login";
import AdminRegistrationEntries from "./pages/admin/Dashboard";
import Home from "./pages/Home";
import Welcome from "./pages/Home/Welcome";
import Profile from "./pages/Home/Profile";
import Topic from "./pages/Home/Topic";
import Addons from "./pages/Home/Addons";
import Payment from "./pages/Home/Payment";
import Done from "./pages/Home/Done";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/registration" />,
    },
    {
        path: "/registration",
        element: <Home />,
        children: [
            {
                index: true,
                element: <Welcome />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "topics",
                element: <Topic />,
            },
            {
                path: "addons",
                element: <Addons />,
            },
            {
                path: "payment",
                element: <Payment />,
            },
            {
                path: "done",
                element: <Done />,
            },
        ],
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
