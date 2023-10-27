import { FC } from "react";

import { Collections, RegistrationStatusesStatusOptions, RegistrationsTypeOptions } from "@/pocketbase-types";
import {
    RegistrationsResponse,
    useDeleteRegistrationMutation,
    useRegistrationsQuery,
    useSettingQuery,
    useUpdateSettingMutation,
} from "@/client";

import * as pbf from "@nedpals/pbf";
import AdminTable from "@/components/layouts/AdminTable";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import RegistrationEditor, { RegistrationEditorContext, useRegistrationEditorContext } from "./RegistrationEditor";
import useAdminFiltersState from "@/lib/admin_utils";
import { Badge } from "@/components/ui/badge";

export default function RegistrationsPage({ title = "Registrations", actions: Actions, rowActions: RowActions }: {
    title?: string
    actions?: FC<{
        selected: RegistrationsResponse[]
        onDelete: () => Promise<void>
        onOpenEditor: RegistrationEditorContext['openEditor']
    }>
    rowActions: FC<{
        id: string, refetch: () => Promise<void>
        onDelete: (id: string) => Promise<void>
        onOpenEditor: RegistrationEditorContext['openEditor']
    }>
}) {
    const editorContext = useRegistrationEditorContext();
    const queryClient = useQueryClient();
    const { data: registrationStatus } = useSettingQuery<'open' | 'closed'>('registration_status');
    const { mutate: updateSetting } = useUpdateSettingMutation();

    const { mutateAsync: deleteMutation } = useDeleteRegistrationMutation();
    const {
        finalFilter,
        searchFilter, setSearchFilter,
        filters, setFilters
    } = useAdminFiltersState((v) => pbf.or(
        pbf.like("email", v),
        pbf.like("first_name", v),
        pbf.like("last_name", v)
    ));

    const {
        data,
        refetch,
        fetchNextPage,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
    } = useRegistrationsQuery({
        sort: "-created",
        filter: finalFilter ? pbf.stringify(finalFilter) : ''
    });

    return <>
        <RegistrationEditor
            open={editorContext.open}
            onOpenChange={editorContext.onOpenChange}
            id={editorContext.currentRegistrantId} />
        <AdminTable
            title={title}
            filters={filters}
            searchFilter={searchFilter}
            filterCollection="registrations"
            filterPlaceholder={`Filter by e-mail, first name, or last name`}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            data={data}
            belowTitle={() => (
                <Card>
                    <CardContent className="pt-3 pb-3">
                        <div className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">
                                    Registration is
                                    <span className={cn({
                                        'text-green-600': registrationStatus?.value === 'open',
                                        'text-red-600': registrationStatus?.value === 'closed'
                                    })}> {registrationStatus?.value}</span>
                                </Label>
                                <p className={cn("text-sm text-muted-foreground")}>
                                    {registrationStatus?.value === 'open' && "You will be receiving any incoming registrations."}
                                    {registrationStatus?.value === 'closed' && "You will not be receiving any incoming registrations."}
                                </p>
                            </div>
                            <Switch
                                checked={registrationStatus?.value === 'open' ?? false}
                                onCheckedChange={(state) => {
                                    updateSetting({
                                        key: 'registration_status',
                                        value: state ? 'open' : 'closed',
                                    }, {
                                        onSuccess(data, variables) {
                                            queryClient.setQueryData(
                                                [Collections.CustomSettings, variables.key],
                                                data)
                                        },
                                    });
                                }} />
                        </div>
                    </CardContent>
                </Card>
            )}
            actions={({ selected }) => {
                if (!Actions) {
                    return <div></div>;
                }

                return <Actions
                    selected={selected}
                    onDelete={async () => {
                        await Promise.all(
                            selected.map(item => deleteMutation(item.id)));
                        await refetch();
                    }}
                    onOpenEditor={editorContext.openEditor} />
            }}
            rowActions={({ record, refetch, onDelete }) => (
                <RowActions
                    id={record.id}
                    refetch={refetch}
                    onDelete={onDelete}
                    onOpenEditor={editorContext.openEditor} />
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
                    header: 'Name / Email',
                    cell: ({ row }) => (
                        <div className="flex flex-col space-y-2 items-start">
                            <p className="font-semibold">{row.original.last_name}, {row.original.first_name}</p>
                            <p className="text-gray-600">{row.original.email.toLowerCase()}</p>
                        </div>
                    )
                },
                {
                    accessorKey: 'created',
                    header: 'Registered',
                    cell: ({ row }) => (new Date(row.original.created)).toLocaleString(),
                }
            ]}
            onRefetch={refetch}
            onDelete={async (r) => { await deleteMutation(r.id); }}
            onFetchNextPage={fetchNextPage}
            onFilterChange={setFilters}
            onSearchFilterChange={setSearchFilter} />
    </>
}
