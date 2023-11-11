import { useParticipantMutation, useParticipantQuery } from "@/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, MessageSquarePlus, RefreshCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import { ClientResponseError } from "pocketbase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CheckinHeader from "@/components/CheckinHeader";
import { cn } from "@/lib/utils";


export default function AddonOrdersClaim() {
    const [participantRemarks, setParticipantRemarks] = useState('');
    const [selectedParticipantId, setSelectedParticipantId] = useState('');
    const { data: participant, isLoading, isRefetching, refetch } = useParticipantQuery(selectedParticipantId.toUpperCase());
    const { mutate: updateParticipant, isLoading: isUpdating } = useParticipantMutation();
    const canClaimMerch = useMemo(() => participant?.expand?.registrant.addons.length !== 0 ?? false, [participant]);

    const updateAddonOrderClaim = (claimed: boolean) => {
        if (!participant) {
            return;
        }

        updateParticipant({
            id: participant.id,
            is_addon_claimed: claimed
        }, {
            onSuccess() {
                toast.success('Participant status updated.');
                setParticipantRemarks('');
                refetch();
            },
            onError(error) {
                if (error instanceof ClientResponseError) {
                    toast.error(`Failed to update participant status: ${error.message}`);
                } else {
                    toast.error('Failed to update participant status.');
                }
            },
        });
    };


    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-4 pt-24">
            <h1 className="text-4xl">Claim add-on order</h1>

            <CheckinHeader
                value={selectedParticipantId}
                onChange={setSelectedParticipantId} />

            {selectedParticipantId && (
                <Card className="relative w-full">
                    <CardHeader className="justify-between flex md:flex-row items-center flex-row md:space-y-0">
                        <CardTitle>Participant Details</CardTitle>

                        <Button disabled={isUpdating} onClick={() => refetch()} variant="secondary">
                            <RefreshCcw className={cn('mr-2', {'animate-spin': isLoading || isRefetching})} />
                            Refresh
                        </Button>
                    </CardHeader>

                    <CardContent className="relative">
                        {(isUpdating || isLoading || isRefetching) && <div className="bg-white/40 h-full w-full absolute inset-0 flex flex-col py-24">
                            <Loading className="w-48 mx-auto" />
                        </div>}

                        {participant && <div className="flex flex-col">
                            <h3 className="font-mono font-light text-gray-400">{participant.pId}</h3>

                            <div>
                                <h3 className="text-4xl font-bold inline-block mb-1">
                                    {participant.expand!.registrant.last_name}, {participant.expand!.registrant.first_name}
                                </h3>
                                <p className="text-2xl font-medium">
                                    {participant.expand!.registrant.type[0].toUpperCase() + participant.expand!.registrant.type.substring(1)}
                                </p>
                                <p className="text-xl text-gray-500">
                                    {participant.expand!.registrant.type === 'student' ?
                                        `${participant.expand!.registrant.expand!.student_profile!.designation} (${participant.expand!.registrant.expand!.student_profile!.year_level}), ${participant.expand!.registrant.expand!.student_profile!.school}` :
                                        `${participant.expand!.registrant.expand!.professional_profile!.title}, ${participant.expand!.registrant.expand!.professional_profile!.organization}`}
                                </p>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="text-lg flex items-center">
                                    {(participant.is_addon_claimed || canClaimMerch) ?
                                        <Check className="text-green-500 mr-2" /> :
                                        <X className="text-red-500 mr-2" />}
                                    <h4>
                                    {participant.is_addon_claimed ?
                                        `Add-on order already claimed` :
                                        `${canClaimMerch ? 'Can' : 'Cannot'} claim add-on`}
                                    </h4>
                                </div>

                                {canClaimMerch &&
                                    <div>
                                        <h4 className="mb-1">Addons to claim</h4>

                                        <ul className="text-xl list-disc pl-4">
                                            {participant.expand!.registrant.expand!.addons.map((addon) => (
                                                <li key={`order_${addon.id}_${addon.expand!.addon.title}`}>
                                                    {addon.expand!.addon.title} {addon.preferences ? `(${Object.entries(addon.preferences).map((e) => e.join(': '))})` : ``}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>}

                                {participant.remarks.length !== 0 && <div className="bg-gray-100 p-3">
                                    <h4 className="mb-1">Remarks</h4>
                                    <p className="text-lg">{participant.remarks}</p>
                                </div>}
                            </div>
                        </div>}
                    </CardContent>

                    <CardFooter className="justify-end space-<x-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isUpdating} variant="secondary">
                                    <MessageSquarePlus className="mr-2" />
                                    Add Remark
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogTitle>Participant Remarks</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <Input
                                        defaultValue={participant?.remarks ?? ''}
                                        onChange={(evt) => setParticipantRemarks(evt.currentTarget.value)}
                                        placeholder="Leave blank if none" />
                                </AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                        if (!participant || participantRemarks.length === 0) {
                                            return;
                                        }

                                        updateParticipant({
                                            id: participant.id,
                                            remarks: participantRemarks,
                                        }, {
                                            onSuccess() {
                                                toast.success('Participant remarks updated.');
                                                refetch();
                                                setParticipantRemarks('');
                                            },
                                            onError(error) {
                                                if (error instanceof ClientResponseError) {
                                                    toast.error(`Failed to update participant remarks: ${error.message}`);
                                                } else {
                                                    toast.error('Failed to update participant remarks.');
                                                }
                                            },
                                        })
                                    }}>Submit</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button disabled={participant?.is_addon_claimed || !canClaimMerch || isUpdating} onClick={() => updateAddonOrderClaim(false)} variant="secondary">
                            <X className="mr-2" />
                            Mark as Unclaimed
                        </Button>

                        <Button disabled={!participant?.is_addon_claimed || !canClaimMerch || isUpdating} onClick={() => updateAddonOrderClaim(true)}>
                            <Check className="mr-2" />
                            Mark as Claimed
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
