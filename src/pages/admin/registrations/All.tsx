import { Button } from "@/components/ui/button";
import NewRegistrationDialog from "./NewRegistrationDialog";
import RegistrationsPage from "./Registrations";
import IconPlus from '~icons/material-symbols/add';
import { RegistrationRowActions } from "./RegistrationRowActions";

export default function AllRegistrations() {
    return <RegistrationsPage
        status="all"
        actions={() => (
            <NewRegistrationDialog>
                <Button>
                    <IconPlus className="mr-2" />
                    Register new participant
                </Button>
            </NewRegistrationDialog>
        )}
        rowActions={({ id, onDelete }) => (
            <RegistrationRowActions
                id={id}
                onDelete={onDelete} />
        )} />
}
