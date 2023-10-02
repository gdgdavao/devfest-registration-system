import { Button } from "@/components/ui/button";
import {
    RegistrationFormContext,
    useSetupRegistrationForm,
} from "@/registration-form";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Stepper from "./Home/Stepper";
import { FormDetailsFormGroupOptions, RegistrationsResponse } from "@/pocketbase-types";
import { useInitiatePaymentMutation, usePaymentIntentQuery, useRegistrationMutation } from "@/client";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import { NextAction } from "@/payment-types";

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

function SubmissionProcessDialog({ isRegistrationLoading, isPaymentLoading, nextAction, intentStatus, ...props }: {
    isRegistrationLoading: boolean
    isPaymentLoading: boolean
    intentStatus: string
    nextAction?: NextAction
} & DialogProps) {
    return <Dialog {...props} open={props.open || (intentStatus.length !== 0 && intentStatus !== 'succeeded')}>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            {isRegistrationLoading && <p>Processing your registration</p>}
            {(isPaymentLoading || intentStatus === 'processing') && <p>Processing your payment</p>}
            {(intentStatus === 'awaiting_next_action' && nextAction) && (
                <div>Iframe goes here</div>
            )}
        </DialogContent>
    </Dialog>
}

export default function Home() {
    const loc = useLocation();
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);

    const { mutate: submitForm, data: registrationRecord, isLoading: isRegistrationLoading } = useRegistrationMutation();
    const { mutate: initiatePayment, data: initIntent, isLoading: isPaymentLoading } = useInitiatePaymentMutation();
    const { data: currentIntent } = usePaymentIntentQuery(initIntent?.id, initIntent?.attributes.client_key);

    const initPay = (registrationRecord: RegistrationsResponse, onError: (err: unknown) => void) => {
        initiatePayment({
            registrant_id: registrationRecord.id,
            payment_id: registrationRecord.payment,
            // TODO: billing and details
        }, {
            onError,
            onSuccess(intentResp) {
                const paymentIntentStatus = intentResp.attributes.status;
                actOnIntentStatus(paymentIntentStatus);
            },
        });
    }

    const actOnIntentStatus = (paymentIntentStatus: string) => {
        if (paymentIntentStatus === 'awaiting_next_action') {
            // Render your modal for 3D Secure Authentication since next_action has a value. You can access the next action via paymentIntent.attributes.next_action.
        } else if (paymentIntentStatus === 'succeeded') {
            // You already received your customer's payment. You can show a success message from this condition.
            navigate(`/registration${routes[groups[index + 1]]}`);
        } else if(paymentIntentStatus === 'awaiting_payment_method') {
            // The PaymentIntent encountered a processing error. You can refer to paymentIntent.attributes.last_payment_error to check the error and render the appropriate error message.
        }  else if (paymentIntentStatus === 'processing'){
            // You need to requery the PaymentIntent after a second or two. This is a transitory status and should resolve to `succeeded` or `awaiting_payment_method` quickly.
        }
    }

    useEffect(() => {
        if (currentIntent) {
            actOnIntentStatus(currentIntent.attributes.status);
        }
    }, [currentIntent]);

    const context = useSetupRegistrationForm({
        onSubmit: (data, onError) => {
            if (registrationRecord) {
                initPay(registrationRecord, onError);
                return;
            }

            submitForm(data, {
                onError,
                onSuccess(record) {
                    initPay(record, onError);
                }
            });
        },
    });


    const goToPrev = () => {
        if (index - 1 < 0) {
            return;
        }
        navigate(`/registration${routes[groups[index - 1]]}`);
    }

    const goToNext = () => {
        if (index + 1 < len - 1) {
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
            open={isRegistrationLoading || isPaymentLoading}
            intentStatus={currentIntent?.attributes.status ?? initIntent?.attributes.status ?? ''} />

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
