import { pb } from "@/client";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function GuestOnly({ children }: { children: ReactNode }) {
    if (pb.authStore.isValid && pb.authStore.isAdmin) {
        return <Navigate to="/admin" />
    }

    return children;
}
