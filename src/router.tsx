import { Navigate, createBrowserRouter } from "react-router-dom";
import GuestOnly from "./components/GuestOnly";

// Layouts
import AdminLayout from "./components/layouts/Admin";

// Pages
import AdminLogin from "./pages/admin/Login";
import Registration from "./pages/Registration";
import Welcome from "./pages/Registration/Welcome";
import Profile from "./pages/Registration/Profile";
import Topic from "./pages/Registration/Topic";
import Addons from "./pages/Registration/Addons";
import Payment from "./pages/Registration/Payment/Payment";
import Done from "./pages/Registration/Done";
import AllRegistrations from "./pages/admin/registrations/All";
import PendingRegistrations from "./pages/admin/registrations/Pending";
import ApprovedRegistrations from "./pages/admin/registrations/Approved";
import RejectedRegistrations from "./pages/admin/registrations/Rejected";
import AllPayments from "./pages/admin/payments/All";
import PaidPayments from "./pages/admin/payments/Paid";
import UnpaidPayments from "./pages/admin/payments/Unpaid";
import PendingPayments from "./pages/admin/payments/Pending";
import MerchSensingSummary from "./pages/admin/merch_sensing/Summary";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/registration" />,
    },
    {
        path: "/registration",
        element: <Registration />,
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
            },
            {
                path: "payments",
                children: [
                    {
                        index: true,
                        element: <AllPayments />
                    },
                    {
                        path: "pending",
                        element: <PendingPayments />
                    },
                    {
                        path: "paid",
                        element: <PaidPayments />
                    },
                    {
                        path: "unpaid",
                        element: <UnpaidPayments />
                    },
                ]
            },
            {
                path: "merch_sensing",
                children: [
                    {
                        index: true,
                        element: <Navigate to="/summary" />
                    },
                    {
                        path: "summary",
                        element: <MerchSensingSummary />
                    }
                ]
            }
        ]
    }
]);
