import PaymentsTable from "./PaymentsTable";
import { PaymentRowActions } from "./PaymentRowActions";

export default function AllPayments() {
    return <PaymentsTable rowActions={PaymentRowActions} />
}
