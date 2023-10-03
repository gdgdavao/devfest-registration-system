import { useFormGroupQuery } from "@/client";
import Title from "@/pages/Home/Title";
import { FormGroupsKeyOptions } from "@/pocketbase-types";
import { ReactNode } from "react";
import Loading from "../Loading";

export default function RegistrationSection({
    id,
    title,
    description,
    children,
}: {
    id?: `${FormGroupsKeyOptions}`;
    title?: string;
    description?: string;
    children: ReactNode;
}) {
    const { data, isLoading } = useFormGroupQuery(id);

    return (
        <div className="relative w-full flex flex-col items-center space-y-4">
            {isLoading && <div className="bg-white/40 h-full w-full absolute inset-0 flex flex-col py-24">
                <Loading className="w-48 mx-auto" />
            </div>}

            {(id || title || description) && (
                <Title
                    title={data?.title ?? title ?? ""}
                    description={data?.description ?? description ?? ""}
                />
            )}

            {children}
        </div>
    );
}
