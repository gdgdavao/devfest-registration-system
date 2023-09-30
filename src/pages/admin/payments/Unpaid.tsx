import PaymentsTable from "./PaymentsTable";
import { PaymentRowActions } from "./PaymentRowActions";

export default function AllRegistrations() {
    return <PaymentsTable
        title="Unpaid payments"
        status="unpaid"
        rowActions={PaymentRowActions} />
}
