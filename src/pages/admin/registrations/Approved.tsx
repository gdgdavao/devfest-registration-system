import { Button } from "@/components/ui/button";
import { RegistrationRowActions } from "./RegistrationRowActions";
import RegistrationsPage from "./Registrations";
import SendMailDialog from "./SendMailDialog";
import IconEmail from '~icons/material-symbols/stacked-email-rounded';
import { eq } from "@nedpals/pbf";

export default function ApprovedRegistrations() {
    return <RegistrationsPage
        status="approved"
        title="Approved"
        actions={() => (
            <div>
                {/* TODO: change filter, add status */}
                <SendMailDialog template="confirm" filter={[{ ...eq('status.status', 'approved'), meta: { type: 'string' } }]}>
                    <Button>
                        <IconEmail className="mr-2" />
                        Send e-mail confirmation
                    </Button>
                </SendMailDialog>
            </div>
        )}
        rowActions={RegistrationRowActions} />
}
