import { FC, useState } from "react";

import { PaymentsStatusOptions } from "@/pocketbase-types";
import { PaymentResponse, useManualPaymentsQuery } from "@/client";
import * as pbf from "@/lib/pb_filters";
import AdminTable from "@/components/layouts/AdminTable";

export default function PaymentsTable({ title = "Payments", status = "all", actions, rowActions: RowActions }: {
    title?: string
    status: 'all' | `${PaymentsStatusOptions}`
    actions?: FC,
    rowActions: FC<{ record: PaymentResponse, refetch: () => Promise<void> }>
}) {
    const [emailFilter, setEmailFilter] = useState('');
    const { data, refetch, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useManualPaymentsQuery({
        sort: '-created',
        filter: pbf.compileFilter(
            pbf.notEmpty('registrant'),
            emailFilter.length > 0 && pbf.like('registrant.email', emailFilter),
            status != 'all' && pbf.eq('status', status))
    });

    return <AdminTable
        title={title}
        filter={emailFilter}
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
        onFilterChange={setEmailFilter} />
}
