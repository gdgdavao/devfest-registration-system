import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import RegistrationSection from "@/components/layouts/RegistrationSection";
import RegistrationForm from "@/components/RegistrationForm";
import Alert, { AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";
import { useFormGroupQuery } from "@/client";
import Loading from "@/components/Loading";
import parseHtml, { domToReact, Element } from "html-react-parser";
import TransactionReceiptFormRenderer from "@/components/form_renderers/TransactionReceiptFormRenderer";
import ExpectedAmountFormRenderer from "@/components/form_renderers/ExpectedAmountFormRenderer";

function ManualPaymentMethodFormRenderer({ onChange }: FormFieldRendererProps) {
    const { data, isLoading } = useFormGroupQuery<{ payment_instructions: string }>("payment");

    useEffect(() => {
        onChange("gcash");
    }, []);

    return (<div className="relative">
        {(!data && isLoading) ? (
            <div className="bg-white/40 h-full w-full absolute inset-0 flex flex-col py-24">
                <Loading className="w-48 mx-auto" />
            </div>
        ) : (
            <div>
                {parseHtml(data?.custom_content?.payment_instructions ?? '<p>No instructions found.</p>', {
                    replace: (domNode) => {
                        if (domNode instanceof Element && domNode.tagName === "ul") {
                            return <ol className="my-6 ml-6 list-disc [&>li]:mt-2">
                                {domToReact(domNode.children)}
                            </ol>;
                        }
                    }
                })}
            </div>
        )}
    </div>);
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
                noLabel={["payment"]}
                group="payment"
                customComponents={{
                    "payment_data.payment_method": ManualPaymentMethodFormRenderer,
                    "payment_data.expected_amount": ExpectedAmountFormRenderer,
                    "payment_data.transaction_details": TransactionReceiptFormRenderer,
                }} />
        </RegistrationSection>
    );
}
