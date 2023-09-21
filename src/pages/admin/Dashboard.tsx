import { useDeleteRegistrationMutation, useRegistrationMutation, useRegistrationQuery, useRegistrationsQuery, useUpdateRegistrationStatusMutation } from "@/client";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

import IconEdit from '~icons/material-symbols/edit-outline';
import IconDelete from '~icons/material-symbols/delete-outline';
import IconScreen from '~icons/material-symbols/thumbs-up-down-outline';
import IconPlus from '~icons/material-symbols/add';

import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RecordIdString, RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReactNode } from "react";
import RegistrationForm from "@/components/RegistrationForm";

export function RegistrationRowActions({ id, onDelete }: { 
    id: RecordIdString, 
    onDelete: (id: RecordIdString) => Promise<void> 
}) {
    return <div className="flex flex-row space-x-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <ScreenRegistrantDialog id={id}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconScreen />
                        </Button>
                    </ScreenRegistrantDialog>
                </TooltipTrigger>
                <TooltipContent>
                    Screen registrant
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <EditRegistrationDialog id={id}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconEdit />
                        </Button>
                    </EditRegistrationDialog>
                </TooltipTrigger>
                <TooltipContent>
                    Edit
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <IconDelete className="text-red-500" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(id)}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>
                    Delete
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}

// TODO: better interface
function ScreenRegistrantDialog({ id, children }: { id: string, children: ReactNode }) {
    const { mutate: markRegistrant } = useUpdateRegistrationStatusMutation();
    const { data: registrant } = useRegistrationQuery(id);
    // const { data: fields } = useRegistrationFieldsQuery(registrantData?.type);

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Screen registrant</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col divide-y-2">
                <div className="flex space-x-2">
                    <Button className="flex-1" onClick={() => {
                        markRegistrant({
                            id: registrant!.status, 
                            status: RegistrationStatusesStatusOptions.approved 
                        });
                    }}>
                        Approve
                    </Button>

                    <Button className="flex-1" onClick={() => {
                        markRegistrant({
                            id: registrant!.status, 
                            status: RegistrationStatusesStatusOptions.rejected 
                        });
                    }}>
                        Reject
                    </Button>
                </div>

                <div className="flex flex-col py-8">
                    <span className="text-slate-500">Name</span>
                    <p className="text-2xl font-bold">{registrant?.last_name}, {registrant?.first_name}</p>
                </div>

                <div className="flex flex-col space-y-2 py-4">
                    <span className="text-slate-500">Contact Details</span>

                    <div className="flex flex-row pt-4">
                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">E-mail Address</span>
                            <p className="font-bold">{registrant?.email}</p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Contact Number</span>
                            <p className="font-bold">{registrant?.contact_number}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-2 py-4">
                    <span className="text-slate-500">Bundle Details</span>

                    <div className="flex flex-row pt-4">
                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Selected bundle</span>
                            <p className="font-bold">{registrant?.expand?.selected_bundle.title}</p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Contact Number</span>
                            <p className="font-bold">{registrant?.contact_number}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
}

function NewRegistrationDialog({ children }: { children: ReactNode }) {
    const { mutate: submitForm } = useRegistrationMutation();

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Register new person</DialogTitle>
                
                <RegistrationForm 
                    onSubmit={(record, onError) => {
                        submitForm(record, { onError });
                    }} />
            </DialogHeader>
        </DialogContent>
    </Dialog>
}

function EditRegistrationDialog({ id, children }: { id: string, children: ReactNode }) {
    const { mutate: submitForm } = useRegistrationMutation();
    const { data } = useRegistrationQuery(id);

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Edit registrant</DialogTitle>
                
                <RegistrationForm
                    data={data} 
                    onSubmit={(record, onError) => {
                        submitForm(record, { onError });
                    }} />
            </DialogHeader>
        </DialogContent>
    </Dialog>
}

export default function AdminRegistrationEntries() {
    const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useRegistrationsQuery();
    const { mutateAsync: deleteRegistration } = useDeleteRegistrationMutation();

    return (
        <div className="max-w-5xl mx-auto pt-12 flex flex-col">
            <h2 className="text-4xl font-bold mb-8">{data?.pages[Math.max((data?.pages.length ?? 0) - 1, 0)].totalPages} registrations</h2>

            <div className="pb-4 flex items-center justify-between space-x-2">
                <Input
                    className="w-1/2"
                    placeholder="Filter by emails..." />

                <NewRegistrationDialog>
                    <Button>
                        <IconPlus className="mr-2" />
                        Register new participant
                    </Button>
                </NewRegistrationDialog>
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
                        cell: ({ row }) => (
                            <RegistrationRowActions
                                id={row.original.id}
                                onDelete={async (id) => {
                                    await deleteRegistration(id, {
                                        async onSuccess() { await refetch(); }
                                    });
                                }} />
                        ),
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
