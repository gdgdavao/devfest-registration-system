import { pb } from "@/client";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function AuthOnly({ children }: { children: ReactNode }) {
    if (!pb.authStore.isValid || !pb.authStore.isAdmin) {
        return <Navigate to="/" />
    }

    return children;
}
