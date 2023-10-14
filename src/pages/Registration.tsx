import { Button } from "@/components/ui/button";
import {
    RegistrationFormContext,
    useSetupRegistrationForm,
} from "@/registration-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Stepper from "./Registration/Stepper";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";
import { RegistrationRecord, useRegistrationMutation } from "@/client";
import { Form } from "@/components/ui/form";
import HeaderImg from "@/assets/header.png";
import ImgClosed from '@/assets/closed_icon.png';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Alert, { AlertDescription } from "@/components/ui/alert";
import { ClientResponseError } from "pocketbase";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import scrollIntoView from 'scroll-into-view-if-needed';
import parseHtml from 'html-react-parser';

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
            <div className="flex flex-col items-center md:py-12 md:px-8">
                {intentStatus !== 'awaiting_payment_method' && (
                    <Loading className="w-1/4 py-20" />
                )}

                {isRegistrationLoading && (
                    <h3 className="font-bold">Processing your registration</h3>)}

                {(isPaymentLoading || intentStatus !== 'awaiting_payment_method') && (<>
                        <h3 className="font-bold">Processing your payment</h3>
                        <p>Pop-up windows may be required for payment. Click the "Allow pop-ups" button if you see a message asking for permission.</p>
                </>)}

                {intentStatus === 'awaiting_payment_method' &&
                    <p className="font-bold">Something went wrong with your chosen payment method.</p>}
            </div>
        </DialogContent>
    </Dialog>
}

export function RegistrationPageBody({ context, mutation }: {
    context: ReturnType<typeof useSetupRegistrationForm>
    mutation: ReturnType<typeof useRegistrationMutation>
}) {
    const navigate = useNavigate();
    const formContainer = useRef<HTMLDivElement>(null);
    const loc = useLocation();
    const [index, setIndex] = useState(0);

    const isPaymentLoading = false;
    // const { isPaymentLoading } = usePayment(
    //     () => {
    //         context.removePersistedFormData();
    //         navigate(`/registration${routes.done}`, { state: { from: 'payments-done' } });
    //     }
    // );
    const { isError, error, isLoading: isRegistrationLoading } = mutation;

    const goToPrev = () => {
        if (index - 1 < 0) {
            return;
        }
        navigate(`/registration${routes[groups[index - 1]]}`);
    }

    const getFieldsOf = (index: number, to = false) => {
        if (to) {
            const fields = [] as string[];
            for (let i = 0; i <= index; i++) {
                fields.push(...getFieldsOf(i));
            }
            return fields as (keyof RegistrationRecord)[];
        }
        return (context.fields.data ?? []).filter(f => f.group === groups[index])
            .map(f => f.type === 'relation' ? f.name + '_data' : f.name) as (keyof RegistrationRecord)[];
    }

    const goToNext = () => {
        let shouldProceed = false;

        if (formContainer.current) {
            shouldProceed = scrollIntoView(formContainer.current, {
                behavior: (actions) => {
                    let scrolled = 0;
                    actions.forEach(a => {
                        if ((a.el.scrollTop / a.top) >= 0.82) {
                            return;
                        }
                        a.el.scrollTo({
                            left: a.left,
                            top: a.top,
                            behavior: 'smooth'
                        });
                        scrolled++;
                    });
                    return scrolled === 0;
                },
                block: 'end',
                scrollMode: 'if-needed',
            });
        }

        if (!shouldProceed) {
            return;
        }

        context.form.trigger(getFieldsOf(index, true))
            .then((isValid) => {
                if (isValid) {
                    context.form.clearErrors();
                    if (groups[index] !== 'payment') {
                        navigate(`/registration${routes[groups[index + 1]]}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        context.onFormSubmit(context.form.getValues());
                    }
                } else if (context.fields.data) {
                    const errorKeys = Object.keys(context.form.formState.errors);
                    const firstErrorKey = errorKeys[0];
                    const firstError = context.fields.data.find(f => f.name === firstErrorKey);
                    if (!firstError || firstError.group === groups[index]) {
                        return;
                    }
                    navigate(`/registration${routes[firstError.group as FormDetailsFormGroupOptions]}`);
                }
            });

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
            intentStatus={''} />

        <div ref={formContainer} className="max-w-3xl w-full mx-auto flex flex-col px-2">
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
                        {(isError || Object.keys(context.form.formState.errors).length > 0) &&
                            <Alert
                                icon="AlertCircle"
                                variant="destructive"
                                className="text-left mb-4"
                                description={error instanceof ClientResponseError ? error.message : 'Oops! There seems to be an error with your registration form.'} />}

                        {context.isLoadedFromPersistedData &&
                            <Alert
                                icon="Info"
                                variant="info"
                                className="text-left mb-4">
                                <AlertDescription className="-my-2">
                                    We have saved your form! Not your data?
                                    <Button
                                        variant="link"
                                        className="px-3"
                                        type="button"
                                        onClick={() => {
                                            context.resetFormToDefault();
                                            navigate(`/registration${routes[groups[0]]}`);
                                        }}>Reset your form.</Button>
                                </AlertDescription>
                            </Alert>}


                        <Outlet />

                        {index < len - 1 && (
                            <div className="sticky bottom-0 flex w-full justify-end mt-12 py-4 bg-white border-t space-x-4">
                                <Button
                                    type="button"
                                    disabled={index == 0 || isRegistrationLoading || isPaymentLoading}
                                    variant={"ghost"}
                                    className="disabled:opacity-0"
                                    onClick={goToPrev}
                                >
                                    Back
                                </Button>
                                <Button type="button" disabled={isRegistrationLoading || isPaymentLoading} onClick={goToNext}>
                                    {index >= len - 2 ? "Submit" : "Next"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </RegistrationFormContext.Provider>
        </div>
    </>);
}

export default function RegistrationPage() {
    const navigate = useNavigate();
    const mutation = useRegistrationMutation();
    const context = useSetupRegistrationForm({
        persistData: true,
        extraFields: [
            {
                group: "payment",
                type: "text",
                name: "payment_data.payment_method",
                title: "Payment Method",
                description: "",
                options: {
                    required: true
                }
            }
        ],
        onSubmit: (data, onError) => {
            // const payment_data = data.payment_data as ((PaymentsRecord & { payment_method: string }) | null)
            // if (registrationRecord) {
            //     initiatePayment(registrationRecord, payment_data!.payment_method)
            //         .catch(onError);
            //     return;
            // }

            // submitForm
            mutation.mutate(data, {
                onError,
                onSuccess() {
                    // initiatePayment(record, payment_data!.payment_method)
                    //     .catch(onError);

                    context.removePersistedFormData();
                    navigate(`/registration${routes.done}`, { state: { from: 'payments-done' } });
                }
            });
        },
    });

    return <main className="flex flex-col w-full">
        <header
            className="bg-black flex justify-center py-0 mb-4 md:mb-8">
            <div className="max-w-4xl mx-auto">
                <img src={HeaderImg} alt="GDG Davao DevFest 2023" />
            </div>
        </header>

        {context.fields.isError ? (
            <div className="max-w-2xl mx-auto text-center py-24 flex flex-col items-center">
                {context.fields.error instanceof ClientResponseError && context.fields.error.data.data.type === 'registration_status_closed' ? (<>
                    <img src={ImgClosed} alt="Done" className="max-w-[23rem] h-full mb-8" />

                    <h1 className="mb-4">{context.fields.error.data.data.title}</h1>
                    <div className="text-xl space-y-3">
                        {parseHtml(context.fields.error.data.data.subtitle)}
                    </div>
                </>) : (<>
                    <h1 className="mb-4">Something went wrong.</h1>
                    <p className="text-xl">There might be a problem on our side. Please try again in a few minutes.</p>
                </>)}
            </div>
        ) : (
            <RegistrationPageBody
                context={context}
                mutation={mutation} />
        )}

        <Footer />
    </main>
}
