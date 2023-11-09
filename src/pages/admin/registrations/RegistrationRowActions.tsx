import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScreenRegistrantDialog from "./ScreenRegistrantDialog";
import { Button } from "@/components/ui/button";

import IconEdit from '~icons/material-symbols/edit-outline';
import IconDelete from '~icons/material-symbols/delete-outline';
import IconScreen from '~icons/material-symbols/thumbs-up-down-outline';
import { RecordIdString } from "@/pocketbase-types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import IconEmail from '~icons/material-symbols/stacked-email-rounded';
import SendMailDialog from "./SendMailDialog";
import { RegistrationsResponse } from "@/client";

export function RegistrationRowActions({ record, refetch, onDelete, onOpenEditor }: {
    record: RegistrationsResponse,
    refetch: () => Promise<void>
    onDelete: (id: RecordIdString) => Promise<void>
    onOpenEditor: (id?: string) => void
}) {
    return <div className="flex flex-row space-x-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <ScreenRegistrantDialog id={record.id} onClose={() => refetch()}>
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
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => onOpenEditor(record.id)}
                        className="h-8 w-8 p-0">
                        <IconEdit />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Edit
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <SendMailDialog template="confirm" recipients={[record.email]}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconEmail />
                        </Button>
                    </SendMailDialog>
                </TooltipTrigger>
                <TooltipContent>
                    Send confirmation e-mail
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
                                <AlertDialogAction onClick={() => onDelete(record.id)}>
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
