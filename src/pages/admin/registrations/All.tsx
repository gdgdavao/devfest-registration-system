import { Button } from "@/components/ui/button";
import NewRegistrationDialog from "./NewRegistrationDialog";
import RegistrationsPage from "./Registrations";
import IconPlus from '~icons/material-symbols/add';
import IconEmail from '~icons/material-symbols/stacked-email-rounded';
import { RegistrationRowActions } from "./RegistrationRowActions";
import SendMailDialog from "./SendMailDialog";

export default function AllRegistrations() {
    return <RegistrationsPage
        status="all"
        actions={() => (
            <div className="flex flex-row space-x-2">
                {/* TODO: change filter, add status */}
                <SendMailDialog type="confirm" filter={`status.status != "pending"`}>
                    <Button>
                        <IconEmail className="mr-2" />
                        Send e-mail confirmation
                    </Button>
                </SendMailDialog>

                <NewRegistrationDialog>
                    <Button>
                        <IconPlus className="mr-2" />
                        Add new registrant
                    </Button>
                </NewRegistrationDialog>
            </div>
        )}
        rowActions={({ id, onDelete }) => (
            <RegistrationRowActions
                id={id}
                onDelete={onDelete} />
        )} />
}
