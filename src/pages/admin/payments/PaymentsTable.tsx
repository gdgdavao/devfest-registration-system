import { FC, useMemo } from "react";

import { ManualPaymentResponse, useManualPaymentsQuery } from "@/client";
import * as pbf from "@nedpals/pbf";
import AdminTable from "@/components/layouts/AdminTable";
import useAdminFiltersState from "@/lib/admin_utils";
import { cn, currencyFormatter } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function PaymentsTable({ title = "Payments", actions, rowActions: RowActions }: {
    title?: string
    actions?: FC<{ selected: ManualPaymentResponse[] }>,
    rowActions: FC<{ record: ManualPaymentResponse, refetch: () => Promise<void> }>
}) {
    const {
        finalFilter: _finalFilter,
        searchFilter: emailFilter, setSearchFilter: setEmailFilter,
        filters, setFilters
    } = useAdminFiltersState((v) => [pbf.like('registrant.email', v)]);

    const finalFilters = useMemo(() => {
        const isValidRegistrant = pbf.notEmpty('registrant');
        if (!_finalFilter) {
            return isValidRegistrant;
        }
        return pbf.and(isValidRegistrant, _finalFilter);
    }, [_finalFilter]);

    const { data, refetch, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } =
        useManualPaymentsQuery({
            sort: '-created',
            filter: pbf.stringify(finalFilters)
        });

    return <AdminTable
        title={title}
        searchFilter={emailFilter}
        filters={filters}
        filterCollection="manual_payments"
        filterExpand={["registrant", "registrant.status"]}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={data}
        actions={actions}
        rowActions={RowActions}
        columns={[
            {
                header: 'Status',
                cell: ({ row }) => (
                    <div className="flex flex-col space-y-2 items-start">
                        <Badge className={cn({
                            'bg-red-500 text-white': !row.original.is_verified && !row.original.has_refunded,
                            'bg-green-500 text-white': row.original.is_verified && !row.original.has_refunded,
                            'bg-amber-400 text-black': row.original.has_refunded
                        })}>
                            {row.original.has_refunded ? 'Refunded' : row.original.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                    </div>
                ),
            },
            {
                accessorKey: 'expand.registrant.email',
                header: 'Registrant e-mail',
            },
            {
                accessorKey: 'expected_amount',
                header: 'Expected Amount',
                cell: ({ row }) => currencyFormatter.format(row.original.expected_amount)
            },
            {
                accessorKey: 'transaction_details.transaction_id',
                header: 'Reference number',
            },
            {
                accessorKey: 'transaction_details.mobile_number',
                header: 'Mobile number',
            },
        ]}
        onRefetch={refetch}
        onDelete={async () => {}}
        onFetchNextPage={fetchNextPage}
        onFilterChange={setFilters}
        onSearchFilterChange={setEmailFilter} />
}
