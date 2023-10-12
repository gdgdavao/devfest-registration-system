// import { useRegistrationMutation } from "@/client";
import { useRegistrationMutation } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { RegistrationFormContext, useSetupRegistrationForm } from "@/registration-form";
import { ReactNode } from "react";

export default function NewRegistrationDialog({ children }: { children: ReactNode }) {
    const { mutate: submitForm } = useRegistrationMutation();
    const context = useSetupRegistrationForm({
        onSubmit: (record, onError) => {
            submitForm(record, { onError });
        }
    });

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Register new person</DialogTitle>
                    <Form {...context.form}>
                        <form onSubmit={context.form.handleSubmit(() => context.onFormSubmit(context.form.getValues()))}>
                            <RegistrationFormContext.Provider value={context}>
                                <RegistrationForm />
                            </RegistrationFormContext.Provider>
                        </form>
                    </Form>
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
