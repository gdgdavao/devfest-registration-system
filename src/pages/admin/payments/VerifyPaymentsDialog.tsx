import { ReactNode, useState } from "react";
import { ManualPaymentResponse, pb, useManualPaymentQuery, useUpdatePaymentMutation } from "@/client";
import { Collections } from "@/pocketbase-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import * as pbf from "@/lib/pb_filters";
import toast from "react-hot-toast";
import { currencyFormatter } from "@/lib/utils";

export default function VerifyPaymentsDialog({ id, children }: { id: string, children: ReactNode }) {
    const [open, setIsOpen] = useState(false);
    // const [remarkModalOpened, setRemarkOpened] = useState(false);
    const { data } = useManualPaymentQuery(id, { enabled: open });
    const { data: dupeData } = useQuery([Collections.ManualPayments, 'dupe', id], () => {
        return pb.collection(Collections.ManualPayments).getFullList<ManualPaymentResponse>(500, {
            filter: pbf.compileFilter(
                data && pbf.and(
                    pbf.not(pbf.eq('id', data.id)),
                    pbf.eq('transaction_details.transaction_id', data.transaction_details?.transaction_id)
                )
            ),
            expand: 'registrant'
        })
    }, { enabled: open && !!data });
    const { mutate: markPayment, isLoading: isStatusProcessing } = useUpdatePaymentMutation();

    const { data: fileToken } = useQuery(['verify_payments', 'file_token'], () => {
        return pb.files.getToken()
    }, { enabled: open });

    return <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-0 max-w-screen-lg">
            <DialogHeader className="pt-4 md:pt-6 sm:pl-6">
                <DialogTitle>Verify Payment</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col-reverse md:flex-row-reverse">
                <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 px-3 flex flex-col-reverse md:flex-col">
                    <div className="flex flex-col space-y-2 py-3">
                        <div className="flex flex-col space-y-2">
                            <Button
                                type="button"
                                variant="success"
                                className="flex-1 py-4 md:py-2"
                                disabled={isStatusProcessing}
                                onClick={() => {
                                    markPayment({
                                        id,
                                        record: {
                                            is_verified: true
                                        }
                                    }, {
                                        onSuccess() {
                                            toast.success('Payment status updated successfully.');
                                            setIsOpen(false);
                                        }
                                    });
                                }}>
                                Mark as paid
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                className="flex-1 py-4 md:py-2"
                                disabled={isStatusProcessing}
                                onClick={() => {
                                    markPayment({
                                        id,
                                        record: {
                                            has_refunded: true
                                        }
                                    }, {
                                        onSuccess() {
                                            toast.success('Payment status updated successfully.');
                                            setIsOpen(false);
                                        }
                                    });
                                }}>
                                Mark as refunded
                            </Button>
                        </div>

                    </div>
                </div>

                <div className="overflow-y-scroll max-h-[calc(100vh-25rem)] md:max-h-[calc(100vh-20rem)] w-full md:w-2/3 lg:w-3/4 flex flex-col divide-y-2 px-6">
                    <div className="flex flex-row flex-wrap md:flex-nowrap py-8 justify-center items-start">
                        <div className="w-full md:w-1/2">
                            {(data && fileToken) &&
                                <img src={pb.files.getUrl(data, data.receipt, { token: fileToken })} />}
                        </div>

                        <div className="md:pl-4 w-full md:w-1/2 flex flex-col divide-y-2">
                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Registrant</span>
                                {data?.expand?.registrant ?
                                    <>
                                        <p className="font-bold">{data.expand.registrant.last_name}, {data.expand.registrant.first_name}</p>
                                        <p>{data.expand.registrant.email}</p>
                                    </> :
                                    <p className="font-bold">Unknown</p>}
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Reference ID</span>
                                <p className="font-bold">{data?.transaction_details?.transaction_id}</p>
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Mobile Number</span>
                                <p className="font-bold">{data?.transaction_details?.mobile_number}</p>
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Expected Amount</span>
                                <p className="font-bold">{currencyFormatter.format(data?.expected_amount ?? 0)}</p>
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Verified?</span>
                                <p className="font-bold">{(data?.is_verified ?? false).toString()}</p>
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Has refunded?</span>
                                <p className="font-bold">{(data?.has_refunded ?? false).toString()}</p>
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Amount Paid</span>
                                <p className="font-bold">{currencyFormatter.format(data?.amount_paid ?? 0)}</p>
                            </div>

                            <div className="flex-1 flex flex-col py-2">
                                <span className="text-slate-500">Date Uploaded</span>
                                <p className="font-bold">{(new Date(data?.created ?? '').toLocaleString())}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2 py-4">
                        <span className="text-slate-500">Duplicates</span>

                        <div className="flex flex-row pt-4 text-sm">
                            <div className="pr-2 w-1/4 flex flex-col">
                                <span className="text-slate-500">Registrant E-mail</span>
                            </div>

                            <div className="pr-2 w-1/4 flex flex-col">
                                <span className="text-slate-500">Reference ID</span>
                            </div>

                            <div className="pr-2 w-1/4 flex flex-col">
                                <span className="text-slate-500">Mobile Number</span>
                            </div>

                            <div className="pr-2 w-1/4 flex flex-col">
                                <span className="text-slate-500">Date</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {dupeData?.length === 0 &&
                                <div className="px-4 py-2 w-full text-center">No duplicate payments found.</div>}

                            {dupeData?.map(dd => (
                                <div key={`dupe_${dd.id}`} className="flex flex-row pt-4 text-sm">
                                    <div className="pr-2 w-1/4 flex flex-col">
                                        <span className="text-slate-800 truncate">
                                            {dd.expand?.registrant ? dd.expand.registrant.email : 'Unknown'}
                                        </span>
                                    </div>

                                    <div className="pr-2 w-1/4 flex flex-col">
                                        <span className="text-slate-800">
                                            {dd.transaction_details?.transaction_id}
                                        </span>
                                    </div>

                                    <div className="pr-2 w-1/4 flex flex-col">
                                        <span className="text-slate-800">{dd.transaction_details?.mobile_number}</span>
                                    </div>

                                    <div className="pr-2 w-1/4 flex flex-col">
                                        <span className="text-slate-800">
                                            {(new Date(dd.created)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </DialogContent>
    </Dialog>;
}
