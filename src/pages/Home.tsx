import { Button } from "@/components/ui/button";
import { RegistrationFormContext, useSetupRegistrationForm } from "@/registration-form";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Stepper from "./Home/Stepper";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";
import { useRegistrationMutation } from "@/client";
import { Form } from "@/components/ui/form";

const routes: Record<FormDetailsFormGroupOptions, string> = {
    welcome: '/',
    profile: '/profile',
    topic: '/topics',
    addOn: '/addons',
    payment: '/payment',
    done: '/done'
}

const groups = Object.keys(routes) as FormDetailsFormGroupOptions[];
const len = groups.length;

// TODO: make payments required!
export default function Home() {
    const [index, setIndex] = useState(0);
    const context = useSetupRegistrationForm({ onSubmit: (data, onError) => submitForm(data, { onError }) });
    const { mutate: submitForm, isLoading } = useRegistrationMutation();
    const navigate = useNavigate();

    const goToNext = useCallback(() => {
        if (index + 1 < len) {
            setIndex(index + 1);
        } else {
            context.onFormSubmit(context.form.getValues());
        }
    }, [index])

    useEffect(() => {
        navigate(`/registration${routes[groups[index]]}`)
    }, [index]);

    return (
        <main className="max-w-3xl mx-auto flex flex-col w-full">
            <header className="flex justify-center py-8 mb-4 md:mb-8">
                <h1>DevFest 2023</h1>
            </header>

            {index > 0 && <Stepper index={index} />}

            <RegistrationFormContext.Provider value={context}>
                <Form {...context.form}>
                    <form onSubmit={context.form.handleSubmit(() => {
                        if (groups[index] === FormDetailsFormGroupOptions.done) {
                            return context.onFormSubmit(context.form.getValues());
                        }
                    })}>
                        <Outlet />

                        {index < len - 1 &&
                            <div className="flex w-full justify-end mt-4 space-x-4">
                                <Button
                                    disabled={index == 0 || isLoading}
                                    variant={"ghost"}
                                    onClick={() => setIndex((idx) => Math.max(idx - 1, 0))}>Back</Button>
                                <Button
                                    disabled={isLoading}
                                    onClick={goToNext}>{ index >= len - 2 ? 'Submit' : 'Next' }</Button>
                            </div>}
                    </form>
                </Form>
            </RegistrationFormContext.Provider>
        </main>
    );
}
