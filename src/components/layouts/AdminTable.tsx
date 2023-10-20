import { FC, ReactNode, useState } from "react";

import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { ColumnDef } from "@tanstack/react-table";
import { InfiniteData } from "@tanstack/react-query";
import { ListResult } from "pocketbase";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import DataFilter from "../data-filter/DataFilter";
import { Collections } from "@/pocketbase-types";
import { DataFilterValue } from "../data-filter/types";

interface RowActionsProps<R> {
    record: R
    refetch: () => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export interface AdminTableProps<R> {
    // Layout
    belowTitle?: FC

    // Data
    data: InfiniteData<ListResult<R>> | undefined
    onRefetch: () => void
    onFetchNextPage: () => void
    hasNextPage: boolean | undefined
    isFetchingNextPage: boolean
    isLoading: boolean

    // Filter
    title: string | ReactNode
    actions?: FC<{ selected: R[] }>

    // Data Table
    selectable?: boolean
    rowActions?: FC<RowActionsProps<R>>
    columns: ColumnDef<R, unknown>[]
    onDelete: (record: R) => Promise<void>

    // Filter
    searchFilter: string
    filters: DataFilterValue[]
    filterPlaceholder?: string
    filterCollection?: `${Collections}`
    onSearchFilterChange: (s: string) => void
    onFilterChange: (s: DataFilterValue[]) => void
}

export default function AdminTable<R>(props: AdminTableProps<R>) {
    const { data, onRefetch: refetch, onFetchNextPage: fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = props;
    const { title, actions: Actions, filters, onFilterChange, searchFilter, filterPlaceholder, onSearchFilterChange: setSearchFilter } = props;
    const { filterCollection, columns, rowActions: RowActions, onDelete, belowTitle: BelowTitle } = props;
    const selectable = props.selectable ?? true;

    const [selected, setSelected]= useState<R[]>([]);
    const debouncedSetSearchFilter = useDebouncedCallback(setSearchFilter, 1000);

    return (
        <div className="flex flex-col">
            <div className="flex items-center space-x-2 mb-8">
                <h2 className="text-4xl font-bold">{ title }</h2>
                <Badge variant="secondary" className="text-lg">{data?.pages[Math.max((data?.pages.length ?? 0) - 1, 0)].totalItems ?? 0}</Badge>
            </div>

            {BelowTitle && <div className="mb-8">
                <BelowTitle />
            </div>}

            <div className="pb-4">
                <div className="pb-2 flex items-center justify-between space-x-2">
                    {selected.length === 0 &&
                        <Input
                            className="w-1/2"
                            defaultValue={searchFilter}
                            onChange={(ev) => debouncedSetSearchFilter(ev.currentTarget.value)}
                            placeholder={filterPlaceholder ?? "Filter by e-mail..."} />}

                    {Actions && <Actions selected={selected} />}
                </div>

                {(selected.length === 0 && filterCollection) &&
                    <DataFilter
                        value={filters}
                        collection={filterCollection}
                        onChange={onFilterChange} />}
            </div>


            <DataTable
                isLoading={isLoading}
                data={data?.pages.map(p => p.items).flat() ?? []}
                onRowSelected={({ rows }) => {
                    setSelected(rows.map(r => r.original));
                }}
                columns={[
                    ...(selectable ? [{
                        id: "select",
                        header: ({ table }) => (
                            <Checkbox
                                checked={table.getIsAllPageRowsSelected()}
                                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                aria-label="Select all"
                                />
                        ),
                        cell: ({ row }) => (
                            <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => row.toggleSelected(!!value)}
                                aria-label="Select row"
                                />
                        ),
                        enableSorting: false,
                        enableHiding: false,
                    } as ColumnDef<R, unknown>] : []),
                    ...columns,
                    ...(RowActions ? [
                        {
                            id: "actions",
                            cell: ({ row }) => (
                                <RowActions
                                    record={row.original}
                                    refetch={async () => refetch()}
                                    onDelete={async () => {
                                        await onDelete(row.original);
                                        refetch();
                                    }} />
                            ),
                        } as ColumnDef<R, unknown>
                    ] : []),
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
