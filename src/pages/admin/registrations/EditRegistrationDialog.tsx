import { useRegistrationMutation, useRegistrationQuery } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { RegistrationFormContext, useSetupRegistrationForm } from "@/registration-form";
import { ReactNode } from "react";

export default function EditRegistrationDialog({ id, children }: { id: string, children: ReactNode }) {
    const { mutate: submitForm } = useRegistrationMutation();
    const context = useSetupRegistrationForm({
        onSubmit: (record, onError) => {
            submitForm(record, { onError });
        }
    });
    const { data } = useRegistrationQuery(id);

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Edit registrant</DialogTitle>

                <RegistrationFormContext.Provider value={context}>
                    <Form {...context.form}>
                        <form onSubmit={context.form.handleSubmit(() => context.onFormSubmit(context.form.getValues()))}>
                            <RegistrationForm data={data} />

                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    </Form>
                </RegistrationFormContext.Provider>
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
