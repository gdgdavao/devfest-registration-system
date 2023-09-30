import { RegistrationsResponse, pb } from "@/client";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";

export default function SendMailDialog({ filter, recipients = [], type, children }: { filter?: string, recipients?: RegistrationsResponse[], type: 'confirm' | 'summary', children: ReactNode }) {
    const finalFilter = useMemo(() => {
        if (recipients.length > 0) {
            const recFilter = recipients.map(r => `id = "${r.id}"`).join(' || ');
            if (filter && filter.length > 0) {
                return `${filter} && (${recFilter})`
            }
            return recFilter;
        }
        return filter ?? '';
    }, [filter, recipients]);

    const { mutate: sendMail } = useMutation((payload: { filter: string, type: 'confirm' | 'summary' }) => {
        return pb.send('/api/admin/send_emails', {
            method: "POST",
            body: payload
        });
    });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Warning</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to send a {type === 'confirm' ? 'confirmation' : 'summary'} e-mail{recipients.length > 0 ? ` to the following recipients` : `.`}
                        {recipients.length > 0 && (
                            <ul className="list-disc pl-4">
                                {recipients.map(r => (
                                    <li key={`recipient_${r.id}`}>{r.email}</li>
                                ))}
                            </ul>
                        )}

                        Press "Continue" to continue sending e-mails.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => sendMail({
                        type,
                        filter: finalFilter
                    })}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
