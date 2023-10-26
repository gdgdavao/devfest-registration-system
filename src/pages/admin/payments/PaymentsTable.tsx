import { FC, useMemo } from "react";

import { ManualPaymentResponse, useManualPaymentsQuery } from "@/client";
import * as pbf from "@nedpals/pbf";
import AdminTable from "@/components/layouts/AdminTable";
import useAdminFiltersState from "@/lib/admin_utils";

export default function PaymentsTable({ title = "Payments", actions, rowActions: RowActions }: {
    title?: string
    actions?: FC<{ selected: ManualPaymentResponse[] }>,
    rowActions: FC<{ record: ManualPaymentResponse, refetch: () => Promise<void> }>
}) {
    const {
        finalFilter: _finalFilter,
        searchFilter: emailFilter, setSearchFilter: setEmailFilter,
        filters, setFilters
    } = useAdminFiltersState((v) => pbf.like('registrant.email', v));

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
