import { useRegistrationMutation, useRegistrationQuery } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReactNode } from "react";

export default function EditRegistrationDialog({ id, children }: { id: string, children: ReactNode }) {
    const { mutate: submitForm } = useRegistrationMutation();
    const { data } = useRegistrationQuery(id);

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Edit registrant</DialogTitle>

                <RegistrationForm
                    data={data}
                    onSubmit={(record, onError) => {
                        submitForm(record, { onError });
                    }} />
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
