import { useRegistrationQuery, useUpdateRegistrationMutation } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import MinimalRichAddonsFormRenderer from "@/components/form_renderers/MinimalRichAddonsFormRenderer";
import MinimalRichTicketFormRenderer from "@/components/form_renderers/MinimalRichTicketsFormRenderer";
import MinimalTopicInterestFormRenderer from "@/components/form_renderers/MinimalTopicInterestFormRenderer";
import TransactionReceiptFormRenderer from "@/components/form_renderers/TransactionReceiptFormRenderer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { RegistrationFormContext, useSetupRegistrationForm } from "@/registration-form";
import { ReactNode, useState } from "react";

export default function EditRegistrationDialog({ id, children }: { id: string, children: ReactNode }) {
    const [open, setIsOpen] = useState(false);
    const { mutate: submitForm } = useUpdateRegistrationMutation();
    const { data } = useRegistrationQuery(id, { enabled: open });
    const context = useSetupRegistrationForm({
        onSubmit: (record, onError) => {
            submitForm({ id, record }, { onError });
        }
    });

    return <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-0 lg:max-w-screen-md">
            <DialogHeader className="px-6 pt-6">
                <DialogTitle>Edit registrant</DialogTitle>
            </DialogHeader>

            <RegistrationFormContext.Provider value={context}>
                <Form {...context.form}>
                    <form
                        className="px-6 overflow-y-scroll max-h-[calc(100vh-10rem)]"
                        onSubmit={context.form.handleSubmit(() => context.onFormSubmit(context.form.getValues()))}>
                        <RegistrationForm
                            data={data}
                            customComponents={{
                                topic_interests: MinimalTopicInterestFormRenderer,
                                addons_data: MinimalRichAddonsFormRenderer,
                                ticket: MinimalRichTicketFormRenderer,
                                "payment_data.transaction_details": TransactionReceiptFormRenderer,
                            }} />

                        <div className="border-t pt-4 pb-6 sticky bottom-0 bg-white flex justify-end">
                            <Button disabled={!context.form.formState.isDirty} type="submit">Save</Button>
                        </div>
                    </form>
                </Form>
            </RegistrationFormContext.Provider>
        </DialogContent>
    </Dialog>
}
