import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScreenRegistrantDialog from "./ScreenRegistrantDialog";
import { Button } from "@/components/ui/button";

import IconEdit from '~icons/material-symbols/edit-outline';
import IconDelete from '~icons/material-symbols/delete-outline';
import IconScreen from '~icons/material-symbols/thumbs-up-down-outline';
import { RecordIdString } from "@/pocketbase-types";
import { TooltipContent } from "@radix-ui/react-tooltip";
import EditRegistrationDialog from "./EditRegistrationDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
