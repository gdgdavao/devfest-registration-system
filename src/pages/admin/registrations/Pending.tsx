import { RegistrationRowActions } from "./RegistrationRowActions";
import RegistrationsPage from "./Registrations";

export default function PendingRegistrations() {
    return <RegistrationsPage
        status="pending"
        title="Pending"
        rowActions={({ id, onDelete }) => (
            <RegistrationRowActions
                id={id}
                onDelete={onDelete} />
        )} />
}
