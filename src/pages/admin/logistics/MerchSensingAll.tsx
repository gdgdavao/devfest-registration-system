import { pb, useMerchSensingDataQuery } from "@/client";

import * as pbf from "@nedpals/pbf";
import AdminTable from "@/components/layouts/AdminTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import useAdminFiltersState from "@/lib/admin_utils";

export default function AllPage() {
    const { finalFilter, searchFilter, setSearchFilter, filters, setFilters } =
        useAdminFiltersState((v) => pbf.or(
            pbf.like('registrant.email', v),
            pbf.like('registrant.first_name', v),
            pbf.like('registrant.last_name', v)
        ));

    const { data, refetch, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useMerchSensingDataQuery({
        sort: '-created',
        filter: pbf.stringify(finalFilter),
    });

    return <AdminTable
        title="Merch Sensing Data"
        searchFilter={searchFilter}
        filters={filters}
        filterCollection="merch_sensing_data"
        selectable={false}
        filterPlaceholder={`Filter by registrant e-mail, first name, or last name`}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={data}
        actions={() => (
            <div>
                <Button asChild>
                    <a href={pb.buildUrl(`/merch-sensing/summary/export`)} download>
                        <Download className="mr-2" />
                        Export data
                    </a>
                </Button>
            </div>
        )}
        columns={[
            {
                accessorKey: 'expand.registrant.email',
                header: 'Registrant Email',
            },
            {
                id: 'preferred_offered_merch',
                header: 'Preferred Offered Merch',
                cell: ({ row }) => {
                    if (!row.original.preferred_offered_merch || row.original.preferred_offered_merch.length === 0) {
                        return <p className="italic text-gray-400">{'<empty>'}</p>
                    }
                    return <p>{row.original.preferred_offered_merch.sort().join(', ')}</p>;
                }
            },
            {
                accessorKey: 'other_preferred_merch',
                header: 'Other Preferred Merch',
                cell: ({ row }) => {
                    if (row.original.other_preferred_offered_merch.length === 0) {
                        return <p className="italic text-gray-400">{'<empty>'}</p>
                    }
                    return <p>{row.original.other_preferred_offered_merch ?? '<empty>'}</p>;
                }
            },
            {
                accessorKey: 'merch_spending_limit',
                header: 'Merch Spending Limit',
                cell: ({ row }) => {
                    return <p>{row.original.merch_spending_limit}</p>;
                }
            }
        ]}
        onRefetch={refetch}
        onDelete={async () => {}}
        onFetchNextPage={fetchNextPage}
        onFilterChange={setFilters}
        onSearchFilterChange={setSearchFilter} />
}
