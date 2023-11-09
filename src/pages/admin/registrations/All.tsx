import { Button } from "@/components/ui/button";
import RegistrationsPage from "./Registrations";
import IconPlus from '~icons/material-symbols/add';
import IconEmail from '~icons/material-symbols/stacked-email-rounded';
import { RegistrationRowActions } from "./RegistrationRowActions";
import SendMailDialog from "./SendMailDialog";
import IconDelete from '~icons/material-symbols/delete-outline';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import useAdminFiltersState from "@/lib/admin_utils";
import { DataFilterValue } from "@/components/data-filter/types";
import { Download } from "lucide-react";
import ExportCsvDialog from "./ExportCsvDialog";
import { REGISTRATION_RESP_EXPAND } from "@/client";

export default function AllRegistrations() {
    const { finalFilterList } = useAdminFiltersState();

    return <RegistrationsPage actions={({ selected, onDelete, onOpenEditor }) => {
            if (selected.length !== 0) {
                return <div className="flex items-center justify-between bg-slate-100 p-2 w-full flex-row">
                    <p className="pl-4">{selected.length} selected</p>

                    <div className="flex space-x-2">
                        <SendMailDialog template="confirm" recipients={selected.map(r => r.email)}>
                            <Button>
                                <IconEmail className="mr-2" />
                                Send e-mail
                            </Button>
                        </SendMailDialog>

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

            return <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                {/* <ImportCsvDialog>
                    <Button>
                        <Upload className="mr-2" />
                        Import
                    </Button>
                </ImportCsvDialog> */}

                <ExportCsvDialog
                    collection="registrations"
                    filter={finalFilterList as DataFilterValue[]}
                    expand={REGISTRATION_RESP_EXPAND.split(",")}>
                    <Button>
                        <Download className="mr-2" />
                        Export
                    </Button>
                </ExportCsvDialog>

                {/* TODO: change filter, add status */}
                <SendMailDialog template="confirm" filter={finalFilterList as DataFilterValue[]}>
                    <Button>
                        <IconEmail className="mr-2" />
                        Send e-mail
                    </Button>
                </SendMailDialog>

                <Button onClick={() => onOpenEditor()} type="button">
                    <IconPlus className="mr-2" />
                    Add new registrant
                </Button>
            </div>
        }}
        rowActions={RegistrationRowActions} />
}
