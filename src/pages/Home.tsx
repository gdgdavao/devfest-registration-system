import { Button } from "@/components/ui/button";
import {
    RegistrationFormContext,
    useSetupRegistrationForm,
} from "@/registration-form";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Stepper from "./Home/Stepper";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";
import { useRegistrationMutation } from "@/client";
import { Form } from "@/components/ui/form";
import HeaderImg from "../assets/header.png";

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

// TODO: make payments required!
export default function Home() {
    const loc = useLocation();
    const [index, setIndex] = useState(0);
    const context = useSetupRegistrationForm({
        onSubmit: (data, onError) => submitForm(data, { onError }),
    });
    const { mutate: submitForm, isLoading } = useRegistrationMutation();
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

    return (
        <main className="flex flex-col w-full">
            <header
                className="bg-black flex justify-center py-0 mb-4 md:mb-8">
                <div className="max-w-4xl mx-auto">
                    <img src={HeaderImg} alt="GDG Davao DevFest 2023" />
                </div>
            </header>

            <div className="max-w-3xl mx-auto flex flex-col px-2">
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
                                        disabled={index == 0 || isLoading}
                                        variant={"ghost"}
                                        className="disabled:opacity-0"
                                        onClick={goToPrev}
                                    >
                                        Back
                                    </Button>
                                    <Button disabled={isLoading} onClick={goToNext}>
                                        {index >= len - 2 ? "Submit" : "Next"}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </RegistrationFormContext.Provider>
            </div>
        </main>
    );
}
