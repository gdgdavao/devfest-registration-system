import { Button } from "@/components/ui/button";
import { RegistrationRowActions } from "./RegistrationRowActions";
import RegistrationsPage from "./Registrations";
import SendMailDialog from "./SendMailDialog";
import IconEmail from '~icons/material-symbols/stacked-email-rounded';

export default function RejectedRegistrations() {
    return <RegistrationsPage
        status="rejected"
        title="Rejected"
        actions={() => (
            <div>
                {/* TODO: change filter, add status */}
                <SendMailDialog template="confirm" filter={`status.status = "rejected"`}>
                    <Button>
                        <IconEmail className="mr-2" />
                        Send e-mail confirmation
                    </Button>
                </SendMailDialog>
            </div>
        )}
        rowActions={RegistrationRowActions} />
}
