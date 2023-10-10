import { FC, useState } from "react";

import { RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { RegistrationsResponse, useDeleteRegistrationMutation, useRegistrationsQuery } from "@/client";

import * as pbf from "@/lib/pb_filters";
import AdminTable from "@/components/layouts/AdminTable";

export default function RegistrationsPage({ title = "Registrations", status = "all", actions: Actions, rowActions: RowActions }: {
    title?: string
    status: 'all' | `${RegistrationStatusesStatusOptions}`
    actions?: FC<{ selected: RegistrationsResponse[], onDelete: () => Promise<void> }>,
    rowActions: FC<{ id: string, refetch: () => Promise<void>, onDelete: (id: string) => Promise<void> }>
}) {
    const { mutateAsync: deleteMutation } = useDeleteRegistrationMutation();
    const [filter, setFilter] = useState('');
    const { data, refetch, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useRegistrationsQuery({
        sort: '-created',
        filter: pbf.compileFilter(
            filter.length > 0 && pbf.or(
                pbf.like('email', filter),
                pbf.like('first_name', filter),
                pbf.like('last_name', filter)
            ),
            status != 'all' &&
                pbf.eq('status.status', status)),
    });

    return <AdminTable
        title={title}
        filter={filter}
        filterPlaceholder={`Filter by e-mail, first name, or last name`}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={data}
        actions={({ selected }) => {
            if (!Actions) {
                return <div></div>;
            }

            return <Actions
                selected={selected}
                onDelete={async () => {
                    await Promise.all(
                        selected.map(item => deleteMutation(item.id)));
                    await refetch();
                }} />
        }}
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
        onFilterChange={setFilter} />
}
