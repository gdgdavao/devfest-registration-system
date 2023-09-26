import { useRegistrationMutation } from "@/client";
import RegistrationForm from "@/components/RegistrationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReactNode } from "react";

export default function NewRegistrationDialog({ children }: { children: ReactNode }) {
    const { mutate: submitForm } = useRegistrationMutation();

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Register new person</DialogTitle>

                <RegistrationForm
                    onSubmit={(record, onError) => {
                        submitForm(record, { onError });
                    }} />
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
