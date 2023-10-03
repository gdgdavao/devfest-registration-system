import { Button } from "@/components/ui/button";
import {
    RegistrationFormContext,
    useSetupRegistrationForm,
} from "@/registration-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Stepper from "./Home/Stepper";
import { FormDetailsFormGroupOptions, RegistrationsResponse } from "@/pocketbase-types";
import { useAttachPaymentIntentMutation, useInitiatePaymentMutation, usePaymentIntentQuery, usePaymentMethodMutation, useRegistrationMutation } from "@/client";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentIntent } from "@/payment-types";
import { popupCenter } from "@/lib/utils";

const routes: Record<FormDetailsFormGroupOptions, string> = {
    welcome: "/",
    profile: "/profile",
    topic: "/topics",
    addOn: "/addons",
    payment: "/payment",
    done: "/done",
};

const groups = Object.keys(routes) as FormDetailsFormGroupOptions[];
const len = groups.length;

function SubmissionProcessDialog({ isRegistrationLoading, isPaymentLoading, intentStatus }: {
    isRegistrationLoading: boolean
    isPaymentLoading: boolean
    intentStatus: string
}) {
    const shouldOpen = useMemo(() => {
        if (!isPaymentLoading && !isRegistrationLoading && intentStatus.length === 0) {
            return false;
        }
        return isPaymentLoading || isRegistrationLoading || intentStatus !== 'succeeded';
    }, [isPaymentLoading, isRegistrationLoading, intentStatus]);

    return <Dialog defaultOpen={shouldOpen} open={shouldOpen}>
        <DialogContent className="lg:max-w-screen-md text-center">
            {isRegistrationLoading && <p className="font-bold">Processing your registration</p>}
            {(isPaymentLoading || intentStatus !== 'awaiting_payment_method') &&
                <p className="font-bold">Processing your payment</p>}
            {intentStatus === 'awaiting_payment_method' &&
                <p className="font-bold">Something went wrong with your chosen payment method.</p>}
        </DialogContent>
    </Dialog>
}

function usePayment(onDone: () => void) {
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

export default function Home() {
    const loc = useLocation();
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const context = useSetupRegistrationForm({
        onSubmit: (data, onError) => {
            if (registrationRecord) {
                initiatePayment(registrationRecord, data.payment_data!.payment_method)
                    .catch(onError);
                return;
            }

            submitForm(data, {
                onError,
                onSuccess(record) {
                    initiatePayment(record, data.payment_data!.payment_method)
                        .catch(onError);
                }
            });
        },
    });

    const { initiatePayment, intentStatus, isPaymentLoading } = usePayment(
        () => navigate(`/registration${routes.done}`)
    );
    const { mutate: submitForm, data: registrationRecord, isLoading: isRegistrationLoading } = useRegistrationMutation();

    const goToPrev = () => {
        if (index - 1 < 0) {
            return;
        }
        navigate(`/registration${routes[groups[index - 1]]}`);
    }

    const goToNext = () => {
        if (groups[index] !== 'payment') {
            navigate(`/registration${routes[groups[index + 1]]}`);
        } else {
            context.onFormSubmit(context.form.getValues());
        }
    }

    useEffect(() => {
        if (loc.pathname.startsWith('/registration/')) {
            const groupName = loc.pathname.substring('/registration'.length);
            setIndex(Object.values(routes).findIndex(g => g.startsWith(groupName)));
        }
    }, [loc]);

    return (<>
        <SubmissionProcessDialog
            isPaymentLoading={isPaymentLoading}
            isRegistrationLoading={isRegistrationLoading}
            intentStatus={intentStatus} />

        <main className="max-w-3xl mx-auto flex flex-col w-full">
            <header className="flex justify-center py-8 mb-4 md:mb-8">
                <h1>DevFest 2023</h1>
            </header>

            {index > 0 && <Stepper index={index} />}

            <RegistrationFormContext.Provider value={context}>
                <Form {...context.form}>
                    <form
                        className="px-4 md:px-0"
                        onSubmit={context.form.handleSubmit(() => {
                            if (
                                groups[index] ===
                                FormDetailsFormGroupOptions.done
                            ) {
                                return context.onFormSubmit(
                                    context.form.getValues()
                                );
                            }
                        })}
                    >
                        <Outlet />

                        {index < len - 1 && (
                            <div className="sticky bottom-0 flex w-full justify-end mt-12 py-4 bg-white border-t space-x-4">
                                <Button
                                    disabled={index == 0 || isRegistrationLoading || isPaymentLoading}
                                    variant={"ghost"}
                                    className="disabled:opacity-0"
                                    onClick={goToPrev}
                                >
                                    Back
                                </Button>
                                <Button disabled={isRegistrationLoading || isPaymentLoading} onClick={goToNext}>
                                    {index >= len - 2 ? "Submit" : "Next"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </RegistrationFormContext.Provider>
        </main>
    </>);
}
