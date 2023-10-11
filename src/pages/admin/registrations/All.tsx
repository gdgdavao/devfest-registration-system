import { Button } from "@/components/ui/button";
import NewRegistrationDialog from "./NewRegistrationDialog";
import RegistrationsPage from "./Registrations";
import IconPlus from '~icons/material-symbols/add';
import IconEmail from '~icons/material-symbols/stacked-email-rounded';
import { RegistrationRowActions } from "./RegistrationRowActions";
import SendMailDialog from "./SendMailDialog";
import IconDelete from '~icons/material-symbols/delete-outline';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download } from "lucide-react";
import { REGISTRATION_RESP_EXPAND, useExportCsvMutation } from "@/client";
import { Collections } from "@/pocketbase-types";

export default function AllRegistrations() {
    const { mutate: exportCsv } = useExportCsvMutation();

    return <RegistrationsPage
        status="all"
        actions={({ selected, onDelete }) => {
            if (selected.length !== 0) {
                return <div className="flex items-center justify-between bg-slate-100 p-2 w-full flex-row">
                    <p className="pl-4">{selected.length} selected</p>

                    <div className="flex space-x-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <IconDelete />
                                    <span>Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are about to delete {selected.length} entries. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete()}>
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            }

                <Button onClick={() => {
                    exportCsv({
                        collection: Collections.Registrations,
                        expand: REGISTRATION_RESP_EXPAND.split(',')
                    });
                }}>
                    <Download className="mr-2" />
                    Export
                </Button>

                {/* TODO: change filter, add status */}
                <SendMailDialog template="confirm" filter={`status.status != "pending"`}>
                    <Button>
                        <IconEmail className="mr-2" />
                        Send e-mail
                    </Button>
                </SendMailDialog>

                <NewRegistrationDialog>
                    <Button>
                        <IconPlus className="mr-2" />
                        Add new registrant
                    </Button>
                </NewRegistrationDialog>
            </div>
        }}
        rowActions={({ id, onDelete }) => (
            <RegistrationRowActions
                id={id}
                onDelete={onDelete} />
        )} />
}
