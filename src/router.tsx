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
import RegistrationSummary from "./pages/admin/RegistrationSummary";
import AllPayments from "./pages/admin/payments/All";
import MerchSensingAll from "./pages/admin/logistics/MerchSensingAll";
import MerchSensingSummary from "./pages/admin/logistics/MerchSensingSummary";
import AddonOrdersSummary from "./pages/admin/logistics/AddonOrdersSummary";

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
        element: <Navigate to="registrations" />,
      },
      {
        index: true,
        element: <Navigate to="registrations" />,
      },
      {
        path: "registrations",
        children: [
          {
            index: true,
            element: <AllRegistrations />,
          },
          { path: "summary", element: <RegistrationSummary /> },
        ],
      },
      {
        path: "payments",
        children: [
          {
            index: true,
            element: <AllPayments />,
          },
        ],
      },
      {
        path: "logistics",
        children: [
          {
            path: "addon_orders",
            children: [
              {
                path: "summary",
                element: <AddonOrdersSummary />,
              },
            ],
          },
          {
            path: "merch_sensing",
            children: [
              {
                index: true,
                element: <MerchSensingAll />,
              },
              {
                path: "summary",
                element: <MerchSensingSummary />,
              },
            ],
          },
        ]
      }
    ],
  },
]);
