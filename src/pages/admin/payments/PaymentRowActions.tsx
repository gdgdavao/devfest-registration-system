import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import IconCheck from '~icons/material-symbols/check-small';
import { ManualPaymentResponse } from "@/client";
import VerifyPaymentsDialog from "./VerifyPaymentsDialog";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PaymentRowActions({ record }: {
    record: ManualPaymentResponse
    refetch: () => Promise<void>
}) {
    return <div className="flex flex-row space-x-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <VerifyPaymentsDialog id={record.id}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconCheck />
                        </Button>
                    </VerifyPaymentsDialog>
                </TooltipTrigger>
                <TooltipContent>
                    Verify payment
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}
