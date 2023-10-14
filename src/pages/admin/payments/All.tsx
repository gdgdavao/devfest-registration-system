import PaymentsTable from "./PaymentsTable";
import { PaymentRowActions } from "./PaymentRowActions";

export default function AllRegistrations() {
    return <PaymentsTable
        rowActions={PaymentRowActions} />
}
