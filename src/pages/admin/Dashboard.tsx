import { pb } from "@/client"
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useInfiniteQuery } from "@tanstack/react-query"

import IconEdit from '~icons/material-symbols/edit-outline';
import IconDelete from '~icons/material-symbols/delete-outline';
import IconScreen from '~icons/material-symbols/thumbs-up-down-outline';
import IconPlus from '~icons/material-symbols/add';

import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminRegistrationEntries() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(['registrations'], ({ pageParam = 1 }) => {
        return pb.collection('registrations').getList(pageParam);
    }, {
        getNextPageParam(data) {
            if (data.page + 1 > data.totalPages) return undefined;
            return data.page + 1;
        },
        getPreviousPageParam(data) {
            if (data.page + 1 < 0) return undefined;
            return data.page - 1;
        },

    })

    return (
        <div className="max-w-5xl mx-auto pt-12 flex flex-col">
            <h2 className="text-4xl font-bold mb-8">{data?.pages[Math.max((data?.pages.length ?? 0) - 1, 0)].totalPages} registrations</h2>

            <div className="pb-4 flex items-center justify-between space-x-2">
                <Input
                    className="w-1/2"
                    placeholder="Filter by emails..." />

                <Button>
                    <IconPlus className="mr-2" />
                    Register new participant
                </Button>
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
                        cell: () => {
                          return (
                            <div className="flex flex-row space-x-2">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <IconScreen />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Screen participant
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <IconEdit />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Edit
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <IconDelete />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Delete
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                          )
                        },
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
