import { ReactNode } from "react";
import { useRegistrationQuery, useUpdateRegistrationStatusMutation } from "@/client";
import { RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// TODO: better interface
export default function ScreenRegistrantDialog({ id, children }: { id: string, children: ReactNode }) {
    const { mutate: markRegistrant } = useUpdateRegistrationStatusMutation();
    const { data: registrant } = useRegistrationQuery(id);
    // const { data: fields } = useRegistrationFieldsQuery(registrantData?.type);

    return <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-md overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Screen registrant</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col divide-y-2">
                <div className="flex space-x-2">
                    <Button className="flex-1" onClick={() => {
                        markRegistrant({
                            id: registrant!.status,
                            status: RegistrationStatusesStatusOptions.approved
                        });
                    }}>
                        Approve
                    </Button>

                    <Button className="flex-1" onClick={() => {
                        markRegistrant({
                            id: registrant!.status,
                            status: RegistrationStatusesStatusOptions.rejected
                        });
                    }}>
                        Reject
                    </Button>
                </div>

                <div className="flex flex-col py-8">
                    <span className="text-slate-500">Name</span>
                    <p className="text-2xl font-bold">{registrant?.last_name}, {registrant?.first_name}</p>
                </div>

                <div className="flex flex-col space-y-2 py-4">
                    <span className="text-slate-500">Contact Details</span>

                    <div className="flex flex-row pt-4">
                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">E-mail Address</span>
                            <p className="font-bold">{registrant?.email}</p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Contact Number</span>
                            <p className="font-bold">{registrant?.contact_number}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-2 py-4">
                    <span className="text-slate-500">Add-on Details</span>

                    <div className="flex flex-row pt-4">
                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Selected add-ons</span>
                            <p className="font-bold">{registrant?.expand?.addons.addon}</p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Contact Number</span>
                            <p className="font-bold">{registrant?.contact_number}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
}
