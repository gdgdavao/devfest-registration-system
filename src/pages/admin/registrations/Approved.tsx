import { RegistrationRowActions } from "./RegistrationRowActions";
import RegistrationsPage from "./Registrations";

export default function ApprovedRegistrations() {
    return <RegistrationsPage
        status="approved"
        title="Approved"
        rowActions={({ id, onDelete }) => (
            <RegistrationRowActions
                id={id}
                onDelete={onDelete} />
        )} />
}
