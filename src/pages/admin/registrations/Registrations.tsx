import { FC, useState } from "react";

import { RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { useDeleteRegistrationMutation, useRegistrationsQuery } from "@/client";

import { compileFilter, eq, like } from "@/lib/pb_filters";
import AdminTable from "@/components/layouts/AdminTable";

export default function RegistrationsPage({ title = "Registrations", status = "all", actions, rowActions: RowActions }: {
    title?: string
    status: 'all' | `${RegistrationStatusesStatusOptions}`
    actions?: FC,
    rowActions: FC<{ id: string, refetch: () => Promise<void>, onDelete: (id: string) => Promise<void> }>
}) {
    const { mutateAsync: deleteMutation } = useDeleteRegistrationMutation();
    const [emailFilter, setEmailFilter] = useState('');
    const { data, refetch, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useRegistrationsQuery({
        sort: '-created',
        filter: compileFilter(
            emailFilter.length > 0 && like('email', emailFilter),
            status != 'all' && eq('status.status', status)),
    });

    return <AdminTable
        title={title}
        status={status}
        filter={emailFilter}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={data}
        actions={actions}
        rowActions={({ record, refetch, onDelete }) => (
            <RowActions id={record.id} refetch={refetch} onDelete={onDelete} />
        )}
        columns={[
            {
                accessorKey: 'type',
                header: 'Type',
            },
            {
                accessorKey: 'email',
                header: 'Email',
            },
            {
                accessorKey: 'first_name',
                header: 'First Name',
            },
            {
                accessorKey: 'last_name',
                header: 'Last Name',
            },
            {
                accessorKey: 'created',
                header: 'Registered',
            }
        ]}
        onRefetch={refetch}
        onDelete={async (r) => { await deleteMutation(r.id); }}
        onFetchNextPage={fetchNextPage}
        onFilterChange={setEmailFilter} />
}
