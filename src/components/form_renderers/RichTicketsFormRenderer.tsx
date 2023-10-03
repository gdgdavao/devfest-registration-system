import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useTicketTypesQuery } from "@/client";
import parseHtml, { domToReact, Element } from 'html-react-parser';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useEffect } from "react";

const currentFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function RichTicketFormRenderer({ value, onChange }: FormFieldRendererProps) {
    const { data } = useTicketTypesQuery();

    useEffect(() => {
        if (typeof data !== 'undefined' && data.length === 1) {
            onChange(data[0].id);
        }
    }, [data]);

    return (
        <div className="flex flex-row space-x-2">
            {data?.map(ticket => (
                <Card key={`ticket_${ticket.id}`} className="flex flex-col w-1/2 md:w-1/3">
                    <CardHeader>
                        <CardTitle>{ticket.name}</CardTitle>
                        {parseHtml(ticket.description, {
                            replace: (domNode) => {
                                if (domNode instanceof Element && domNode.attribs) {
                                    return <CardDescription>{domToReact(domNode.children)}</CardDescription>;
                                }
                            }
                        })}
                    </CardHeader>
                    <CardFooter className="mt-auto flex flex-col">
                        <div className="w-full pb-4">
                            <p className="text-sm text-gray-400">Price</p>
                            <p className="text-lg font-semibold">{currentFormatter.format(ticket.price)}</p>
                        </div>

                        <Button
                            type="button"
                            variant={value === ticket.id ? 'secondary' : 'default'}
                            onClick={() => onChange(ticket.id)}
                            disabled={data.length === 1}
                            className="w-full">
                            {value === ticket.id ? (data.length === 1 ? 'Pre-selected' : 'Remove') : 'Select'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
