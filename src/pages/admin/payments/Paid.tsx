import PaymentsTable from "./PaymentsTable";
import { PaymentRowActions } from "./PaymentRowActions";

export default function AllRegistrations() {
    return <PaymentsTable
        status="paid"
        title="Paid payments"
        rowActions={PaymentRowActions} />
}
