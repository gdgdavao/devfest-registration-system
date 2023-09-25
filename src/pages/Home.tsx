import { Button } from "@/components/ui/button";
import { RegistrationFormContext, useSetupRegistrationForm } from "@/registration-form";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Stepper from "./Home/Stepper";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";

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
    const context = useSetupRegistrationForm();
    // const { mutate: submitForm } = useRegistrationMutation();
    const navigate = useNavigate();

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
                <Outlet />
            </RegistrationFormContext.Provider>

            <div className="flex w-full justify-end mt-4 space-x-4">
                <Button
                    disabled={index == 0}
                    variant={"ghost"}
                    onClick={() => setIndex((idx) => Math.max(idx - 1, 0))}>Back</Button>
                <Button
                    disabled={index >= len}
                    onClick={() => setIndex((idx) => Math.min(idx + 1, len))}>Next</Button>
            </div>
        </main>
    );
}
