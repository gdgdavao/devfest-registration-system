// import { useRegistrationMutation } from "@/client";
import { useRegistrationMutation } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import ExpectedAmountFormRenderer from "@/components/form_renderers/ExpectedAmountFormRenderer";
import MinimalRichAddonsFormRenderer from "@/components/form_renderers/MinimalRichAddonsFormRenderer";
import MinimalRichTicketFormRenderer from "@/components/form_renderers/MinimalRichTicketsFormRenderer";
import MinimalTopicInterestFormRenderer from "@/components/form_renderers/MinimalTopicInterestFormRenderer";
import { Button } from "@/components/ui/button";
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
        <DialogContent className="lg:max-w-screen-xl overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Register new registrant</DialogTitle>
                    <Form {...context.form}>
                        <form
                            onSubmit={context.form.handleSubmit(() => context.onFormSubmit(context.form.getValues()))}>
                            <RegistrationFormContext.Provider value={context}>
                                <RegistrationForm
                                    className="max-w-2xl mx-auto"
                                    customComponents={{
                                        topic_interests: MinimalTopicInterestFormRenderer,
                                        ticket: MinimalRichTicketFormRenderer,
                                        addons_data: MinimalRichAddonsFormRenderer,
                                        "payment_data.expected_amount": ExpectedAmountFormRenderer,
                                    }} />

                                <div className="py-4 flex justify-end sticky bottom-[-22px] border-t bg-white">
                                    <Button>Save</Button>
                                </div>
                            </RegistrationFormContext.Provider>
                        </form>
                    </Form>
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
