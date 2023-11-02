import { pb, useAddonOrdersQuery } from "@/client";

import * as pbf from "@nedpals/pbf";
import AdminTable from "@/components/layouts/AdminTable";
import useAdminFiltersState from "@/lib/admin_utils";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddonOrdersAllPage() {
    const { finalFilter, searchFilter, setSearchFilter, filters, setFilters } =
        useAdminFiltersState((v) => [
            pbf.like('email', v),
            pbf.like('first_name', v),
            pbf.like('last_name', v)
        ]);

    const { data, refetch, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useAddonOrdersQuery({
        sort: '-created',
        filter: pbf.stringify(finalFilter),
    });

    return <AdminTable
        title="Add-on Orders"
        searchFilter={searchFilter}
        filters={filters.map(f => ({ 
            ...f, 
            field: !f.field.startsWith('addons.') ? `addons.${f.field}` : f.field 
        }))}
        filterExpand={["registrant"]}
        filterCollection="addon_orders"
        selectable={false}
        filterPlaceholder={`Filter by registrant e-mail, first name, or last name`}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={data}
        actions={() => (
            <div>
                <Button asChild>
                    <a href={pb.buildUrl(`/admin/addon_orders/export?token=${pb.authStore.token}&filter=${pbf.stringify(finalFilter)}`)} download>
                        <Download className="mr-2" />
                        Export data
                    </a>
                </Button>
            </div>
        )}
        columns={[
            {
                header: 'Name / Email',
                cell: ({ row }) => (
                    <div className="flex flex-col space-y-2 items-start">
                        <p className="font-semibold">{row.original.last_name}, {row.original.first_name}</p>
                        <p className="text-gray-600">{row.original.email.toLowerCase()}</p>
                    </div>
                )
            },
            {
                header: 'Add-ons',
                cell: ({ row }) => (
                    <ul className="list-disc pl-4">
                        {row.original.expand!.addons!.map(order => (
                            <li key={`addon_order_${row.original.id}${order.id}`}>
                                {order.expand!.addon.title}
                            
                                {order.preferences && (
                                    <ul className="list-disc pl-4">
                                        {Object.entries(order.preferences).map(([name, value]) => (
                                            <li key={`addon_order_${row.original.id}${order.id}_${name}`}>
                                                {name}: {value}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )
            }
        ]}
        onRefetch={refetch}
        onDelete={async () => {}}
        onFetchNextPage={fetchNextPage}
        onFilterChange={setFilters}
        onSearchFilterChange={setSearchFilter} />
}
