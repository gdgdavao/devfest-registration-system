import { useRegistrationMutation } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import RichBundleFormRenderer from "@/components/form_renderers/RichBundleFormRenderer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Welcome from "./Welcome";
import Profile from "./Profile/Profile";
import Stepper from "./Stepper";
import { useRegistrationForm } from "@/registration-form";

// TODO: make payments required!
export type homeRoute =
    | "welcome"
    | "profile"
    | "topic"
    | "addOn"
    | "payment"
    | "done";

interface Props {
    homeRoute?: homeRoute;
}

export default function Home({ homeRoute = "welcome" }: Props) {
    const { mutate: submitForm } = useRegistrationMutation();
    const {
        form,
        resetFormToDefault,
        fieldsQuery: { data },
    } = useRegistrationForm();

    console.log(data);

    return (
        <main className="flex flex-col w-full">
            <header className="flex justify-center py-8 mb-4 md:mb-8">
                <h1>DevFest 2023</h1>
            </header>

            {/* <RegistrationForm
                onSubmit={(record, onError) => {
                    submitForm(record, { onError });
                }}
                customComponents={{
                    selected_bundle: RichBundleFormRenderer,
                }}
            /> */}

            <Form {...form}>
                {homeRoute === "welcome" && <Welcome />}

                {homeRoute !== "welcome" && <Stepper homeRoute={homeRoute} />}
                {homeRoute === "profile" && <Profile userType="Student" />}

                <div className="flex w-full justify-end mt-4 space-x-4">
                    {homeRoute !== "welcome" && (
                        <Button variant={"ghost"}>Back</Button>
                    )}
                    {homeRoute !== "done" && <Button>Next</Button>}
                </div>
            </Form>
        </main>
    );
}
