import { FC, useState } from "react";

import { RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { useDeleteRegistrationMutation, useRegistrationsQuery } from "@/client";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

export default function RegistrationsPage({ title, status = "all", actions: Actions, rowActions: RowActions }: {
    title?: string
    status: 'all' | `${RegistrationStatusesStatusOptions}`
    actions?: FC,
    rowActions: FC<{ id: string, refetch: () => Promise<void>, onDelete: (id: string) => Promise<void> }>
}) {
    const { mutateAsync: deleteRegistration } = useDeleteRegistrationMutation();
    const [emailFilter, setEmailFilter] = useState('');
    const debouncedSetEmailFilter = useDebouncedCallback((v: string) => setEmailFilter(v), 1000);
    const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useRegistrationsQuery({
        filter: (emailFilter.length > 0 ? `email~"${emailFilter}" &&` : '') + (status != 'all' ? `status.status="${status}"` : ''),
    });

    return (
        <div className="max-w-5xl mx-auto pt-12 flex flex-col">
            <h2 className="text-4xl font-bold mb-8">
                { title ?? 'Registrations' } {data?.pages[Math.max((data?.pages.length ?? 0) - 1, 0)].totalPages}
            </h2>

            <div className="pb-4 flex items-center justify-between space-x-2">
                <Input
                    defaultValue={emailFilter}
                    onChange={(ev) => debouncedSetEmailFilter(ev.target.value)}
                    className="w-1/2"
                    placeholder="Filter by emails..." />

                {Actions && <Actions />}
            </div>

            <DataTable
                data={data?.pages.map(p => p.items).flat() ?? []}
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
                    },
                    {
                        id: "actions",
                        cell: ({ row }) => (
                            <RowActions
                                id={row.original.id}
                                refetch={async () => { await refetch() }}
                                onDelete={async (id) => {
                                    await deleteRegistration(id, {
                                        async onSuccess() { await refetch(); }
                                    });
                                }} />
                        ),
                    },
                ]} />

                {hasNextPage &&
                    <Button
                        className="mt-4 w-2/3 mx-auto"
                        onClick={() => fetchNextPage()}
                        variant="secondary">
                        {isFetchingNextPage ? 'Fetching...' : 'Load more items'}
                    </Button>}
        </div>
    )
}
