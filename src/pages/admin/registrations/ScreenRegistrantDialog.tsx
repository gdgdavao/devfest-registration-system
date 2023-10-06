import { ReactNode } from "react";
import { useRegistrationQuery, pb, useUpdateRegistrationStatusMutation } from "@/client";
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

                <div className="flex flex-row py-8 justify-center items-end">
                    <div className="flex-1 flex flex-col">
                        <span className="text-slate-500">Name</span>
                        <p className="text-2xl font-bold">{registrant?.last_name}, {registrant?.first_name}</p>
                        <p className="font-bold">
                            {
                                registrant?.type == "student" ?
                                <span>Student</span>:
                                <span>Professional</span>
                            }
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <span className="text-slate-500">Ticket Type</span>
                        <p className="font-bold">{registrant?.expand?.ticket?.name}</p>
                        <p className="font-bold">
                            {
                                registrant?.created &&
                                new Date(registrant?.created).toLocaleString()
                            }
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <span className="text-slate-500">Payment Status</span>
                        <p className="font-bold">{registrant?.expand?.payment?.receipt.length != 0 ? 'Paid' : 'Unpaid'}</p>
                        <p className="font-bold">
                            {
                                registrant?.expand?.payment?.expected_amount &&
                                <span>₱{registrant.expand.payment.expected_amount}</span>
                            }
                        </p>
                    </div>
                </div>

                <div className="flex flex-col space-y-2 py-4">
                    <span className="text-slate-500">Bio</span>

                    <div className="flex flex-row pt-4">
                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Gender</span>
                            <p className="font-bold">{registrant?.sex}</p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Age Range</span>
                            <p className="font-bold">{registrant?.age_range}</p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <span className="text-slate-500">Years of Tech Experience</span>
                            <p className="font-bold">{registrant?.years_tech_exp}</p>
                        </div>
                    </div>
                </div>

                {
                    registrant?.expand?.student_profile &&
                    <div className="flex flex-col space-y-2 py-4">
                        <span className="text-slate-500">Student Profile</span>

                        <div className="flex flex-row pt-4">
                            <div className="flex-1 flex flex-col">
                                <span className="text-slate-500">School</span>
                                <p className="font-bold">{registrant?.expand?.student_profile?.school}</p>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className="text-slate-500">Designation</span>
                                <p className="font-bold">{registrant?.expand?.student_profile?.designation}</p>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className="text-slate-500">Year Level</span>
                                <p className="font-bold">{registrant?.expand?.student_profile?.year_level}</p>
                            </div>
                        </div>
                    </div>
                }
                {
                    registrant?.expand?.professional_profile &&
                    <div className="flex flex-col space-y-2 py-4">
                        <span className="text-slate-500">Professional Profile</span>

                        <div className="flex flex-row pt-4">
                            <div className="flex-1 flex flex-col">
                                <span className="text-slate-500">Is Fresh Graduate?</span>
                                <p className="font-bold">
                                    {
                                        registrant?.expand?.professional_profile?.is_fresh_graduate ?
                                        <span>Yes</span> :
                                        <span>No</span>
                                    }
                                </p>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className="text-slate-500">Organization</span>
                                <p className="font-bold">{registrant?.expand?.professional_profile?.organization}</p>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className="text-slate-500">Title</span>
                                <p className="font-bold">{registrant?.expand?.professional_profile?.title}</p>
                            </div>
                        </div>
                    </div>
                }

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

                <div className="space-y-2 py-4">
                    <span className="text-slate-500">Selected add-ons</span>
                    <div className="flex flex-col divide-y-2">
                        {
                            registrant?.expand?.addons?.map(addon => {
                                return (
                                    <div className="pt-4">
                                        <div className="flex text-slate-500">Add-on Details</div>
                                        <div className="flex flex-row justify-around py-2 ">
                                            <div className="flex flex-col">
                                                <span className="text-slate-500">Name</span>
                                                <p className="font-bold">
                                                    {addon?.expand?.addon.title}
                                                </p>
                                                {
                                                    addon?.preferences != undefined &&
                                                    Object.entries(addon?.preferences).map(([key, value], id) => (
                                                        <span key={id}>
                                                            <span>{key}:</span> {value}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                            <div className="flex flex-col">
                                                <img
                                                    src={pb.files.getUrl(addon?.expand!.addon, addon!.expand!.addon.cover_image!)}
                                                    className="rounded-md object-cover h-20 w-auto border"
                                                    alt={addon?.expand?.addon.title} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-500">Price</span>
                                                <p className="font-bold">{addon?.expand?.addon.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
}
