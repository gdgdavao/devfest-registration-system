import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import IconCheck from '~icons/material-symbols/check-small';
import { TooltipContent } from "@radix-ui/react-tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PaymentResponse, useUpdatePaymentMutation } from "@/client";
import { PaymentsStatusOptions } from "@/pocketbase-types";

export function PaymentRowActions({ record, refetch }: {
    record: PaymentResponse
    refetch: () => Promise<void>
}) {
    const { mutate: updatePayment } = useUpdatePaymentMutation();

    return <div className="flex flex-row space-x-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <IconCheck />
                                </Button>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {/* TODO: message */}
                                    This will be marked as paid.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updatePayment({
                                    id: record.id,
                                    record: {
                                        status: PaymentsStatusOptions.paid
                                    }
                                }, {
                                    onSettled() {
                                        refetch();
                                    }
                                })}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>
                    Mark as paid
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}
