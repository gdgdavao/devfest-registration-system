import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import RegistrationSection from "@/components/layouts/RegistrationSection";
import RegistrationForm from "@/components/RegistrationForm";
import Alert, { AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { useSubtotal } from "@/registration-form";
import { useFormContext } from "react-hook-form";
import { useFormGroupQuery, usePaymentMethodsQuery } from "@/client";
import Loading from "@/components/Loading";
import parseHtml, { domToReact, Element } from "html-react-parser";
import TransactionReceiptFormRenderer from "@/components/form_renderers/TransactionReceiptFormRenderer";

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

function ExpectedAmountFormRenderer({ value, onChange }: FormFieldRendererProps) {
    const { data: paymentMethods } = usePaymentMethodsQuery();
    const form = useFormContext();
    const selectedPaymentMethodId = form.getValues('payment_data.payment_method');
    const selectedPaymentMethod = useMemo(() => {
        return paymentMethods?.find(m => m.id === selectedPaymentMethodId);
    }, [selectedPaymentMethodId, paymentMethods]);
    const { selectedTicket, selectedAddons, subtotal } = useSubtotal();
    const processorFee = useMemo(() => {
        if (!selectedPaymentMethod) return 0;
        return (subtotal * selectedPaymentMethod.processorRate) + selectedPaymentMethod.extraProcessorFee;
    }, [selectedPaymentMethod, subtotal]);

    useEffect(() => {
        if (!value || value !== subtotal) {
            onChange(subtotal);
        }
    }, []);

    useEffect(() => {
        if (!value || value !== subtotal) {
            onChange(subtotal);
        }
    }, [value, subtotal]);

    return (
        <Card>
            <CardContent className="pt-4">
                <div className="divide-y">
                    {selectedTicket && <div className="flex flex-row items-center justify-between py-2">
                        <p>{selectedTicket.name}</p>
                        <p className="font-bold">{currencyFormatter.format(selectedTicket.price)}</p>
                    </div>}

                    {selectedAddons.length > 0 && <div className="flex flex-col py-2 space-y-2">
                        {selectedAddons.map((addon) =>
                            <div key={`addon_${addon.id}`} className="flex flex-row items-center justify-between">
                                <p>{addon.title}</p>
                                <p className="font-bold">{currencyFormatter.format(addon.price)}</p>
                            </div>)}
                    </div>}

                    {(selectedPaymentMethod && selectedPaymentMethod.processorRate > 0) && <div className="flex flex-row items-center py-2 justify-between">
                        <p>Processor Fee ({(selectedPaymentMethod.processorRate * 100).toFixed(1)}%{selectedPaymentMethod.extraProcessorFee > 0 ? ` + ${currencyFormatter.format(selectedPaymentMethod.extraProcessorFee)}` : ``})</p>
                        <p className="font-bold">{currencyFormatter.format(processorFee)}</p>
                    </div>}

                    <div className="flex flex-row items-start justify-between py-2">
                        <p>Total</p>
                        <p className="font-bold text-2xl">{currencyFormatter.format(subtotal + processorFee)}</p>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <div className="space-y-4 text-sm text-gray-600">
                    <p>Upon clicking "Submit", you agree that the data you have provided will be used for the sole purpose of activities related to this event and for marketing purposes. We uphold the Republic Act No. 10173: Data Privacy Act with utmost vigilance.</p>
                    <p>Also by clicking "Submit", you will also be redirected to your chosen payment method to complete your purchase.</p>
                </div>
            </CardFooter>
        </Card>
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
