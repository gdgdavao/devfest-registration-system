import { Button } from "@/components/ui/button";
import {
    RegistrationFormContext,
    useSetupRegistrationForm,
} from "@/registration-form";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Stepper from "./Home/Stepper";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";
import { useInitiatePaymentMutation, useRegistrationMutation } from "@/client";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

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

function SubmissionProcessDialog({ isRegistrationLoading, isPaymentLoading, ...props }: { isRegistrationLoading: boolean, isPaymentLoading: boolean } & DialogProps) {
    return <Dialog {...props}>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            {isRegistrationLoading && <p>Processing your registration</p>}
            {isPaymentLoading && <p>Processing your payment</p>}
        </DialogContent>
    </Dialog>
}

export default function Home() {
    const loc = useLocation();
    const { mutate: submitForm, isLoading: isRegistrationLoading } = useRegistrationMutation();
    const { mutate: initiatePayment, isLoading: isPaymentLoading } = useInitiatePaymentMutation();
    const [index, setIndex] = useState(0);
    const context = useSetupRegistrationForm({
        onSubmit: (data, onError) => {
            submitForm(data, { 
                onError,
                onSuccess(data) {
                    initiatePayment({
                        registrant_id: data.id,
                        payment_id: data.payment,
                        // TODO: billing and details
                    }, {
                        onError,
                        onSuccess() {
                            navigate(`/registration${routes[groups[index + 1]]}`);
                        },
                    });
                } 
            });
        },
    });
    const navigate = useNavigate();

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
            open={isRegistrationLoading || isPaymentLoading}
            isRegistrationLoading={isRegistrationLoading}
            isPaymentLoading={isPaymentLoading} />

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
