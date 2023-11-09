import { usePaymentMethodsQuery } from "@/client";
import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useFormContext } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useSubtotal } from "@/registration-form";
import { Card, CardContent, CardFooter } from "../ui/card";
import { currencyFormatter } from "@/lib/utils";

export default function ExpectedAmountFormRenderer({ value, onChange }: FormFieldRendererProps) {
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
