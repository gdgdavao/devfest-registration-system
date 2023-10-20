import { FC, useState } from "react";

import { ManualPaymentResponse, useManualPaymentsQuery } from "@/client";
import * as pbf from "@/lib/pb_filters";
import AdminTable from "@/components/layouts/AdminTable";
import { DataFilterValue } from "@/components/data-filter/types";

export default function PaymentsTable({ title = "Payments", actions, rowActions: RowActions }: {
    title?: string
    actions?: FC<{ selected: ManualPaymentResponse[] }>,
    rowActions: FC<{ record: ManualPaymentResponse, refetch: () => Promise<void> }>
}) {
    const [emailFilter, setEmailFilter] = useState('');
    const [filters, setFilters] = useState<DataFilterValue[]>([]);
    const { data, refetch, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } =
        useManualPaymentsQuery({
            sort: '-created',
            filter: pbf.compileFilter(
                pbf.notEmpty('registrant'),
                emailFilter.length > 0 && pbf.like('registrant.email', emailFilter),
                ...filters.map(f => f.expr))
        });

    return <AdminTable
        title={title}
        searchFilter={emailFilter}
        filters={filters}
        filterCollection="manual_payments"
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={data}
        actions={actions}
        rowActions={RowActions}
        columns={[
            {
                accessorKey: 'expand.registrant.email',
                header: 'Registrant',
            },
            {
                accessorKey: 'expected_amount',
                header: 'Expected Amount',
            },
            {
                accessorKey: 'transaction_details.transaction_id',
                header: 'Transaction ID',
            },
        ]}
        onRefetch={refetch}
        onDelete={async () => {}}
        onFetchNextPage={fetchNextPage}
        onFilterChange={setFilters}
        onSearchFilterChange={setEmailFilter} />
}
