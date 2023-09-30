import PaymentsTable from "./PaymentsTable";
import { PaymentRowActions } from "./PaymentRowActions";

export default function AllRegistrations() {
    return <PaymentsTable
        status="pending"
        title="Pending payments"
        rowActions={PaymentRowActions} />
}
