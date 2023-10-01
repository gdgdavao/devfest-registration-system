// import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import RegistrationSection from "@/components/layouts/RegistrationSection";
import RegistrationForm from "@/components/RegistrationForm";
import Alert, { AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// import { FormField } from "@/components/ui/form";
// import { useFormContext } from "react-hook-form";

function PaymentMethodFormRenderer(props: FormFieldRendererProps) {
    return (
        <div className="flex flex-col space-y-2">
            <Card>
                <CardHeader>
                    <CardTitle>Pay with GCash</CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pay with Maya</CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}

export default function Payment() {
    return (
        <RegistrationSection id="payment">
            <Alert icon="Info" className="text-left" variant="info">
                <AlertDescription>
                    Your payment will be on hold while we review your registration.
                    Your payment will be processed if you are accepted. Otherwise, we will refund your payment in full.
                </AlertDescription>
            </Alert>

            <RegistrationForm
                group="payment"
                noLabel
                customComponents={{
                    "payment.payment_method": PaymentMethodFormRenderer
                }} />
        </RegistrationSection>
    );
}
