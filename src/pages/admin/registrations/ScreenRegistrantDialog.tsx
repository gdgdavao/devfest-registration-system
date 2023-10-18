import { ReactNode, useState } from "react";
import { useScreeningDetailsQuery, useUpdateRegistrationStatusMutation } from "@/client";
import { RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MinimalTopicInterestFormRenderer from "@/components/form_renderers/MinimalTopicInterestFormRenderer";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";

// TODO: better interface
export default function ScreenRegistrantDialog({ id: destinationId, children }: { id: string, children: ReactNode }) {
    const queryClient = useQueryClient();
    const [id, setRegistrantId] = useState(destinationId);
    const [open, setIsOpen] = useState(false);
    const { mutate: markRegistrant, isLoading: isStatusProcessing } = useUpdateRegistrationStatusMutation();
    const { data } = useScreeningDetailsQuery(id, { enabled: open });
    const registrant = data?.record;
    // const { data: fields } = useRegistrationFieldsQuery(registrantData?.type);

    return <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-0 max-w-screen-lg">
            <DialogHeader className="pt-4 md:pt-6 sm:pl-6">
                <DialogTitle>Screen registrant</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col-reverse md:flex-row-reverse">
                <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 px-3 flex flex-col-reverse md:flex-col">
                    <div className="flex flex-col space-y-2 py-3">
                        <div className="space-x-2 flex">
                            <Button
                                className="flex-1 py-6 md:py-2"
                                disabled={!data || !data.prev_id || isStatusProcessing}
                                onClick={() => setRegistrantId(id => data!.prev_id ?? id)}>
                                Prev
                            </Button>

                            <Button
                                className="flex-1 py-6 md:py-2"
                                disabled={!data || !data.next_id || isStatusProcessing}
                                onClick={() => setRegistrantId(id => data!.next_id ?? id)}>
                                Next
                            </Button>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Button
                                type="button"
                                variant="success"
                                className="flex-1 py-4 md:py-2"
                                disabled={isStatusProcessing}
                                onClick={() => {
                                    markRegistrant({
                                        id: registrant!.status,
                                        status: RegistrationStatusesStatusOptions.approved
                                    }, {
                                        onSuccess() {
                                            queryClient.invalidateQueries({ queryKey: ['screening', id], exact: true });
                                            setRegistrantId(id => data!.next_id ?? id);
                                        },
                                    });
                                }}>
                                Approve
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                className="flex-1 py-4 md:py-2"
                                disabled={isStatusProcessing}
                                onClick={() => {
                                markRegistrant({
                                    id: registrant!.status,
                                    status: RegistrationStatusesStatusOptions.rejected
                                }, {
                                    onSuccess() {
                                        queryClient.invalidateQueries({ queryKey: ['screening', id], exact: true });
                                        setRegistrantId(id => data!.next_id ?? id);
                                    },
                                });
                            }}>
                                Reject
                            </Button>
                        </div>

                    </div>

                    <div className="md:flex flex-col py-4 space-y-2">
                        <p className="font-bold">Criteria</p>
                        {data?.criteria.map(c => (
                            <div className="flex items-center space-x-2" key={`criteria_${c.id}`}>
                                {c.value ? <CheckCircle className="text-green-500" /> : <XCircle className="text-destructive" />}
                                <p>{c.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-scroll max-h-[calc(100vh-25rem)] md:max-h-[calc(100vh-20rem)] w-full md:w-2/3 lg:w-3/4 flex flex-col divide-y-2 px-6">
                    <div className="flex flex-row flex-wrap md:flex-nowrap py-8 justify-center items-start">
                        <div className="w-full md:w-1/2 flex flex-col">
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

                        <div className="flex-1 flex flex-col py-2">
                            <span className="text-slate-500">Ticket Type</span>
                            <p className="font-bold">{registrant?.expand?.ticket?.name}</p>
                        </div>

                        <div className="flex-1 flex flex-col py-2">
                            <span className="text-slate-500">Date/Time Registered</span>
                            <p className="font-bold">
                                {
                                    registrant?.created &&
                                    new Date(registrant?.created).toLocaleString()
                                }
                            </p>
                            <p className="font-bold text-sm text-gray-500">
                                Confirmation: {
                                    registrant?.expand?.status?.status &&
                                    <span>{registrant?.expand?.status?.status}</span>
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

                    <div className="flex flex-col space-y-2 py-4">
                        <span className="text-slate-500">Topic Interests</span>

                        <div className="flex flex-row pt-4">
                            <MinimalTopicInterestFormRenderer
                                field={{name: '', title: '', group: '', description: '', options: {values: []}, type: 'json'}}
                                value={registrant?.topic_interests}
                                onChange={() => {}}
                                onBlur={() => {}}
                                name="topic_interests"
                                className="w-full"
                                disabled />
                        </div>
                    </div>
                </div>
            </div>

        </DialogContent>
    </Dialog>
}
