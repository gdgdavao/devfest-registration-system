import { useEffect, useMemo, useRef } from "react";
import { useAttachPaymentIntentMutation, useInitiatePaymentMutation, usePaymentIntentQuery, usePaymentMethodMutation } from "@/client";
import { PaymentIntent } from "@/payment-types";
import { popupCenter } from "@/lib/utils";
import { RegistrationsResponse } from "@/pocketbase-types";

export function usePayment(onDone: () => void) {
    const nextActionWindow = useRef<Window | null>(null);

    const { mutateAsync: _initiatePayment, data: initPayload, isLoading: isPaymentLoading } = useInitiatePaymentMutation();
    const { mutateAsync: createPaymentMethod } = usePaymentMethodMutation();
    const { mutateAsync: attachPayment, data: initIntent } = useAttachPaymentIntentMutation();
    const { data: currentIntent, isRefetching, refetch: refetchIntent } = usePaymentIntentQuery(
        initPayload?.endpoints.payment_intent,
        initPayload?.api_key,
        initPayload?.client_key
    );

    const intentStatus = useMemo(() => {
        return (currentIntent ?? initIntent)?.attributes.status ?? '';
    }, [currentIntent, initIntent]);

    const closePaymentWindow = () => {
        // You already received your customer's payment. You can show
        // a success message from this condition.
        if (nextActionWindow.current) {
            nextActionWindow.current.close();
            nextActionWindow.current = null;
        }
    }

    const actOnIntentStatus = (paymentIntent: PaymentIntent) => {
        const paymentIntentStatus = paymentIntent.attributes.status;
        if (paymentIntentStatus === 'awaiting_next_action') {
            // Render your modal for 3D Secure Authentication since next_action has a value.
            // You can access the next action via paymentIntent.attributes.next_action.

            if (!nextActionWindow.current) {
                nextActionWindow.current = popupCenter({
                    url: paymentIntent.attributes.next_action.redirect.url,
                    title: 'GDG DevFest Davao 2023 Payment',
                    w: 800,
                    h: 500
                });
            } else if (nextActionWindow.current.closed) {
                closePaymentWindow();
                return;
            }

            setTimeout(() => {
                refetchIntent();
            }, 4500);
        } else if (paymentIntentStatus === 'succeeded') {
            // You already received your customer's payment. You can show
            // a success message from this condition.
            closePaymentWindow();
            onDone();
        } else if(paymentIntentStatus === 'awaiting_payment_method') {
            // The PaymentIntent encountered a processing error. You can refer to
            // paymentIntent.attributes.last_payment_error to check the error and
            // render the appropriate error message.
        }  else if (paymentIntentStatus === 'processing'){
            // You need to requery the PaymentIntent after a second or two. This is
            // a transitory status and should resolve to `succeeded` or `awaiting_payment_method` quickly.
            if (nextActionWindow.current && nextActionWindow.current.closed) {
                closePaymentWindow();
                return;
            }

            setTimeout(() => {
                refetchIntent();
            }, 4500);
        }
    }

    const initiatePayment = async (registrationRecord: RegistrationsResponse, paymentMethod: string) => {
        const initResp = await _initiatePayment({
            registrant_id: registrationRecord.id,
            payment_id: registrationRecord.payment,
        });

        // 2. Create payment method
        const paymentMethodId = await createPaymentMethod({
            endpoint: initResp.endpoints.create_payment_method,
            apiKey: initResp.api_key,
            payload: {
                data: {
                    attributes: {
                        type: paymentMethod,
                        // TODO: billing and details
                        details: null
                    }
                }
            }
        });

        // 3. Attach to payment intent
        const paymentIntent = await attachPayment({
            endpoint: initResp.endpoints.attach_payment_intent,
            apiKey: initResp.api_key,
            clientKey: initResp.client_key,
            paymentMethodId
        });

        actOnIntentStatus(paymentIntent);
    }

    useEffect(() => {
        if (currentIntent && !isRefetching) {
            actOnIntentStatus(currentIntent);
        }
    }, [currentIntent, isRefetching]);

    return {
        initiatePayment,
        intentStatus,
        currentIntent,
        isPaymentLoading
    };
}
