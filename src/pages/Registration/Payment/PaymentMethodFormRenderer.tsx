import { SVGProps } from "react";
import { usePaymentMethodsQuery } from "@/client";
import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import IconCard from "~icons/material-symbols/add-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentIcons = {
    "card": IconCard,
    "gcash": (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width="1.8em"
            height="1.8em"
            viewBox="0 0 192 192"
            {...props}
        >
            <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={12}
                d="M84 96h36c0 19.882-16.118 36-36 36s-36-16.118-36-36 16.118-36 36-36c9.941 0 18.941 4.03 25.456 10.544"
                />
            <path
                fill="#000"
                d="M145.315 66.564a6 6 0 0 0-10.815 5.2l10.815-5.2ZM134.5 120.235a6 6 0 0 0 10.815 5.201l-10.815-5.201Zm-16.26-68.552a6 6 0 1 0 7.344-9.49l-7.344 9.49Zm7.344 98.124a6 6 0 0 0-7.344-9.49l7.344 9.49ZM84 152c-30.928 0-56-25.072-56-56H16c0 37.555 30.445 68 68 68v-12ZM28 96c0-30.928 25.072-56 56-56V28c-37.555 0-68 30.445-68 68h12Zm106.5-24.235C138.023 79.09 140 87.306 140 96h12c0-10.532-2.399-20.522-6.685-29.436l-10.815 5.2ZM140 96c0 8.694-1.977 16.909-5.5 24.235l10.815 5.201C149.601 116.522 152 106.532 152 96h-12ZM84 40c12.903 0 24.772 4.357 34.24 11.683l7.344-9.49A67.733 67.733 0 0 0 84 28v12Zm34.24 100.317C108.772 147.643 96.903 152 84 152v12a67.733 67.733 0 0 0 41.584-14.193l-7.344-9.49Z"
                />
            <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={12}
                d="M161.549 58.776C166.965 70.04 170 82.666 170 96c0 13.334-3.035 25.96-8.451 37.223"
                />
        </svg>
    ),
    "paymaya": (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.8em"
            height="1.8em"
            viewBox="0 0 48 49"
            fill="none"
            {...props}
        >
            <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M40.5 5.664h-33c-1.1 0-2 .9-2 2v33c0 1.1.9 2 2 2h33c1.1 0 2-.9 2-2v-33c0-1.1-.9-2-2-2Z"
                />
            <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M31.722 25.391v2.982a2.21 2.21 0 0 1-3.77 1.563"
                />
            <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M31.722 21.745v3.646a2.209 2.209 0 1 1-4.419 0v-3.646M9.5 23.955a2.21 2.21 0 0 1 4.419 0m0 0V27.6m0-3.645a2.21 2.21 0 1 1 4.419 0V27.6M9.5 21.745V27.6m15.533-2.209a2.21 2.21 0 0 1-4.419 0v-1.436a2.21 2.21 0 0 1 4.419 0m0 3.645v-5.855M38.5 25.391a2.21 2.21 0 0 1-4.419 0v-1.436a2.21 2.21 0 0 1 4.419 0m0 3.645v-5.855"
                />
        </svg>
    )
}

export default function PaymentMethodFormRenderer({ value, onChange }: FormFieldRendererProps) {
    const { data: paymentMethods } = usePaymentMethodsQuery();

    return (
        <div className="flex flex-col space-y-2">
            {paymentMethods?.map((method) => {
                const Icon = PaymentIcons[method.id as keyof typeof PaymentIcons];

                return (
                    <Card key={`payment_method_${method.id}`}>
                        <CardContent className="pt-6 flex flex-row items-center justify-between">
                            <div className="flex space-x-1 flex-1 items-center">
                                <Icon className="text-md" />
                                <p>Pay with {method.label}</p>
                            </div>

                            <Button
                                type="button"
                                onClick={() => onChange(method.id)}
                                variant={value === method.id ? 'secondary' : 'default'}>
                                {value === method.id ? 'Selected' : 'Select'}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
