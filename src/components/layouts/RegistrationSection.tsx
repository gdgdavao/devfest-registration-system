import { useFormGroupQuery } from "@/client";
import Title from "@/pages/Home/Title";
import { FormGroupsKeyOptions } from "@/pocketbase-types";
import { ReactNode } from "react";

export default function RegistrationSection({ id, title, description, children }: {
    id?: `${FormGroupsKeyOptions}`
    title?: string
    description?: string
    children: ReactNode
}) {
    const { data } = useFormGroupQuery(id);

    return (
        <div className="w-full flex flex-col items-center space-y-4">
            {(id || title || description) && <Title
                title={data?.title ?? title ?? ''}
                description={data?.description ?? description ?? ''}
            />}

            {children}
        </div>
    );
}
