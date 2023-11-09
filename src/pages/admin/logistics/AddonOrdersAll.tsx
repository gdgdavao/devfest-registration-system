import { pb, useAddonOrdersQuery } from "@/client";

import * as pbf from "@nedpals/pbf";
import AdminTable from "@/components/layouts/AdminTable";
import useAdminFiltersState from "@/lib/admin_utils";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RegistrationStatusesStatusOptions, RegistrationsTypeOptions } from "@/pocketbase-types";

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
        filterExpand={["registrant", "registrant.status"]}
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
                header: 'Type / Status',
                cell: ({ row }) => (
                    <div className="flex flex-col space-y-2 items-start">
                        <Badge variant={row.original.type === RegistrationsTypeOptions.professional ? 'default' : 'secondary'}>
                            {row.original.type}
                        </Badge>

                        <Badge className={cn({
                            'bg-red-500 text-white': row.original.expand?.status.status === RegistrationStatusesStatusOptions.rejected,
                            'bg-green-500 text-white': row.original.expand?.status.status === RegistrationStatusesStatusOptions.approved,
                            'bg-amber-400 text-black': row.original.expand?.status.status === RegistrationStatusesStatusOptions.pending
                        })}>{row.original.expand?.status.status}</Badge>
                    </div>
                ),
            },
            {
                header: 'Name',
                cell: ({ row }) => (
                    <p className="font-semibold">{row.original.last_name}, {row.original.first_name}</p>
                ),
            },
            {
                header: 'Add-on Orders',
                cell: ({ row }) => (
                    <ul className="min-w-[16rem] max-w-[20rem] text-md list-disc pl-4">
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
