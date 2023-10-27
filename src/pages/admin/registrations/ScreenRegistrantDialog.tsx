import { ReactNode, useEffect, useState } from "react";
import { useScreeningDetailsQuery, useUpdateRegistrationStatusMutation } from "@/client";
import { RegistrationStatusesReasonOptions, RegistrationStatusesStatusOptions } from "@/pocketbase-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MinimalTopicInterestFormRenderer from "@/components/form_renderers/MinimalTopicInterestFormRenderer";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialogContent, AlertDialogTitle, AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import useAdminFiltersState from "@/lib/admin_utils";
import * as pbf from "@nedpals/pbf";
import { cn } from "@/lib/utils";
import VerifyPaymentsDialog from "../payments/VerifyPaymentsDialog";

export default function ScreenRegistrantDialog({ id: destinationId, onClose, children }: { id: string, onClose?: () => void, children: ReactNode }) {
    const { finalFilter } = useAdminFiltersState((v) => pbf.or(
        pbf.like("email", v),
        pbf.like("first_name", v),
        pbf.like("last_name", v)
    ));

    const queryClient = useQueryClient();
    const [id, setRegistrantId] = useState(destinationId);
    const [open, setIsOpen] = useState(false);
    const [remarkModalOpened, setRemarkOpened] = useState(false);
    const [remark, setRemark] = useState('');
    const { mutate: _markRegistrant, isLoading: isStatusProcessing } = useUpdateRegistrationStatusMutation();
    const { data, refetch } = useScreeningDetailsQuery(id, { enabled: open, filter: pbf.stringify(finalFilter) });
    const registrant = data?.record;

    const markRegistrant = (status: RegistrationStatusesStatusOptions, reason?: RegistrationStatusesReasonOptions) => {
        if (reason === RegistrationStatusesReasonOptions.others && remark.length === 0) {
            setRemarkOpened(true);
            return;
        }

        _markRegistrant({
            id: registrant!.status,
            status,
            reason,
            remarks: remark
        }, {
            onSuccess() {
                toast.success('Registration confirmed successfully.');
                queryClient.invalidateQueries({ queryKey: ['screening', id], exact: true });
                setRegistrantId(id => data!.next_id ?? id);
            },
            onSettled() {
                if (remark.length > 0) {
                    setRemark('');
                }
            }
        });
    }

    useEffect(() => {
        if (remarkModalOpened) {
            setTimeout(() => (document.body.style.pointerEvents = ""), 100);
        }
    }, [remarkModalOpened]);

    return <Dialog open={open} onOpenChange={(state) => {
        setIsOpen(state);
        if (!state) {
            onClose?.();
        }
    }}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="flex flex-col p-0 max-w-screen-lg max-h-screen h-screen md:h-[90vh]">
            <DialogHeader className="pt-4 md:pt-6 sm:pl-6">
                <DialogTitle>Screen registrant</DialogTitle>
            </DialogHeader>

            <AlertDialog open={remarkModalOpened} onOpenChange={setRemarkOpened}>
                <AlertDialogContent>
                    <AlertDialogTitle>Remarks for rejection</AlertDialogTitle>
                    <AlertDialogDescription>
                        <Input
                            defaultValue={remark}
                            onChange={(evt) => setRemark(evt.currentTarget.value)}
                            placeholder="Leave blank if none" />
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (remark.length === 0) {
                                setRemark('N/A');
                            }

                            markRegistrant(
                                RegistrationStatusesStatusOptions.rejected,
                                RegistrationStatusesReasonOptions.others
                            );
                        }}>Submit</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex-1 overflow-y-auto flex flex-col-reverse md:flex-row-reverse">
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
                                    markRegistrant(RegistrationStatusesStatusOptions.approved);
                                }}>
                                Approve
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="flex-1 py-4 md:py-2"
                                        disabled={isStatusProcessing}>
                                        Reject
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56">
                                    {Object.values(RegistrationStatusesReasonOptions).map(reason => (
                                        <DropdownMenuItem
                                            className="hover:bg-gray-300/50"
                                            key={`reject_reason_${reason}`}
                                            onClick={() => {
                                                markRegistrant(
                                                    RegistrationStatusesStatusOptions.rejected,
                                                    reason
                                                );
                                            }}>
                                            {reason}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <VerifyPaymentsDialog
                                id={data?.record.payment ?? ''}
                                onChange={() => { refetch(); }}>
                                <Button disabled={!data}>
                                    Verify payment
                                </Button>
                            </VerifyPaymentsDialog>
                        </div>

                    </div>

                    <div className="md:flex flex-col py-4 space-y-2">
                        <p className="font-bold">Criteria</p>
                        {data?.criteria.map(c => (
                            <div className="flex items-start" key={`criteria_${c.id}`}>
                                <div className="w-8 pr-2">{c.value ? <CheckCircle className="text-green-500" /> : <XCircle className="text-destructive" />}</div>
                                <div>
                                    <p>{c.label}</p>
                                    {c.description && <p className="text-xs text-gray-600">{c.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-scroll flex-1 w-full md:w-2/3 lg:w-3/4 flex flex-col divide-y-2 px-6">
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
                                <span> / </span>
                                <span>{registrant?.expand?.ticket?.name}</span>
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col py-2 md:pl-2">
                            <span className="text-slate-500">Date/Time Registered</span>
                            <p className="font-bold">
                                {
                                    registrant?.created &&
                                    new Date(registrant?.created).toLocaleString()
                                }
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col py-2 md:pl-2">
                            <span className="text-slate-500">Status</span>
                            <p className={cn('font-bold', {
                                'text-red-500': registrant?.expand?.status.status === RegistrationStatusesStatusOptions.rejected,
                                'text-green-500': registrant?.expand?.status.status === RegistrationStatusesStatusOptions.approved,
                            })}>
                                <span>{registrant?.expand?.status?.status ?? 'Unknown'}</span>
                                {registrant?.expand?.status.status === RegistrationStatusesStatusOptions.rejected && (
                                    <span> ({registrant?.expand?.status.reason})</span>
                                )}
                            </p>

                            {registrant?.expand?.status.remarks && <p className="font-bold text-sm text-gray-500">
                                Remarks: {registrant?.expand?.status?.remarks ?? 'N/A'}
                            </p>}
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
                                readOnly />
                        </div>
                    </div>
                </div>
            </div>

        </DialogContent>
    </Dialog>;
}
