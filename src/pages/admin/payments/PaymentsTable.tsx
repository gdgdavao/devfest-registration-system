import { FC, useState } from "react";

import { PaymentsStatusOptions } from "@/pocketbase-types";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { PaymentResponse, usePaymentsQuery } from "@/client";
import { compileFilter, eq, like } from "@/lib/pb_filters";

export default function PaymentsTable({ title, status = "all", actions: Actions, rowActions: RowActions }: {
    title?: string
    status: 'all' | `${PaymentsStatusOptions}`
    actions?: FC,
    rowActions: FC<{ record: PaymentResponse, refetch: () => Promise<void> }>
}) {
    const [emailFilter, setEmailFilter] = useState('');
    const debouncedSetEmailFilter = useDebouncedCallback((v: string) => setEmailFilter(v), 1000);
    const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = usePaymentsQuery({
        filter: compileFilter(
            emailFilter.length > 0 && like('registrant.email', emailFilter),
            status != 'all' && eq('status', status))
    });

    return (
        <div className="max-w-5xl mx-auto pt-12 flex flex-col">
            <h2 className="text-4xl font-bold mb-8">
                { title ?? 'Payments' } {data?.pages[Math.max((data?.pages.length ?? 0) - 1, 0)].totalPages}
            </h2>

            <div className="pb-4 flex items-center justify-between space-x-2">
                <Input
                    defaultValue={emailFilter}
                    onChange={(ev) => debouncedSetEmailFilter(ev.target.value)}
                    className="w-1/2"
                    placeholder="Filter by email..." />

                {Actions && <Actions />}
            </div>

            <DataTable
                data={data?.pages.map(p => p.items).flat() ?? []}
                columns={[
                    {
                        accessorKey: 'expand.registrant.email',
                        header: 'Registrant',
                    },
                    {
                        accessorKey: 'status',
                        header: 'Status',
                    },
                    {
                        accessorKey: 'expected_amount',
                        header: 'Expected Amount',
                    },
                    {
                        accessorKey: 'amount_paid',
                        header: 'Amount Paid',
                    },
                    {
                        accessorKey: 'transaction_id',
                        header: 'Transaction ID',
                    },
                    {
                        id: "actions",
                        cell: ({ row }) => (
                            <RowActions
                                record={row.original}
                                refetch={async () => { await refetch() }} />
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
