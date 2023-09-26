import { RegistrationRowActions } from "./RegistrationRowActions";
import RegistrationsPage from "./Registrations";

export default function RejectedRegistrations() {
    return <RegistrationsPage
        status="rejected"
        title="Rejected"
        rowActions={({ id, onDelete }) => (
            <RegistrationRowActions
                id={id}
                onDelete={onDelete} />
        )} />
}
