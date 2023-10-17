import { useRegistrationMutation, useRegistrationQuery, useUpdateRegistrationMutation } from "@/client";
import { RegistrationFormContext, useSetupRegistrationForm } from "@/registration-form";
import RegistrationForm from "@/components/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MinimalRichAddonsFormRenderer from "@/components/form_renderers/MinimalRichAddonsFormRenderer";
import MinimalRichTicketFormRenderer from "@/components/form_renderers/MinimalRichTicketsFormRenderer";
import MinimalTopicInterestFormRenderer from "@/components/form_renderers/MinimalTopicInterestFormRenderer";
import TransactionReceiptFormRenderer from "@/components/form_renderers/TransactionReceiptFormRenderer";
import { useMemo, useState } from "react";
import Loading from "@/components/Loading";

export interface RegistrationEditorContext {
    currentRegistrantId: string | undefined,
    openEditor: (id?: string) => void
    open: boolean
    onOpenChange: (s: boolean) => void
}

export function useRegistrationEditorContext(): RegistrationEditorContext {
    const [registrantId, setCurrentRegistrantId] = useState<string>();
    const [_open, setOpen] = useState(false);
    const open = useMemo(() => {
        if (registrantId) {
            return true;
        } else {
            return _open;
        }
    }, [registrantId, _open]);

    return {
        currentRegistrantId: registrantId,
        openEditor(id) {
            if (id) {
                setCurrentRegistrantId(id);
            } else {
                setOpen(true);
            }
        },
        open,
        onOpenChange(state) {
            if (!state) {
                setCurrentRegistrantId(undefined);
                setOpen(false);
            } else {
                return;
            }
        },
    }
}

export default function RegistrationEditor({ id, open, onOpenChange }: {
    id?: string
    open: boolean
    onOpenChange: (v: boolean) => void
}) {
    const { mutate: updateRegistrant } = useUpdateRegistrationMutation();
    const { mutate: createRegistrant } = useRegistrationMutation();

    const { data, isLoading } = useRegistrationQuery(id ?? '', { enabled: !!id && open });
    const context = useSetupRegistrationForm({
        onSubmit: (record, onError) => {
            if (id) {
                updateRegistrant({ id, record }, { onError });
            } else {
                createRegistrant(record, { onError });
            }
        }
    });

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 lg:max-w-screen-md">
            <DialogHeader className="px-6 pt-6">
                <DialogTitle>{id ? 'Edit registrant' : 'Add new registrant'}</DialogTitle>
            </DialogHeader>

            <div className="relative h-full">
                {(id && isLoading) && <div className="bg-white/40 h-full w-full absolute inset-0 flex flex-col py-24 z-10">
                    <div className="h-full mx-auto">
                        <Loading className="w-48" />
                    </div>
                </div>}

                {(!id || !isLoading) && <RegistrationFormContext.Provider value={context}>
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
                </RegistrationFormContext.Provider>}
            </div>
        </DialogContent>
    </Dialog>
}
