import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useTicketTypesQuery } from "@/client";
import parseHtml from 'html-react-parser';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const currentFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function RichTicketFormRenderer({ value = [], onChange }: FormFieldRendererProps) {
    const { data } = useTicketTypesQuery();

    return (
        <div className="flex flex-row space-x-2">
            {data?.map(ticket => (
                <Card key={`ticket_${ticket.id}`} className="flex flex-col w-1/3">
                    <CardHeader>
                        <CardTitle>{ticket.name}</CardTitle>
                        <CardDescription>{parseHtml(ticket.description)}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto flex flex-col">
                        <div className="w-full pb-4">
                            <p className="text-sm text-gray-400">Price</p>
                            <p className="text-lg font-semibold">{currentFormatter.format(ticket.price)}</p>
                        </div>

                        <Button
                            type="button"
                            variant={value.includes(ticket.id) ? 'secondary' : 'default'}
                            onClick={() => onChange(value.includes(ticket.id) ? value.filter((id: string) => id !== ticket.id) : value.concat(ticket.id))}
                            className="w-full">
                            {value.includes(ticket.id) ? 'Remove' : 'Select'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
