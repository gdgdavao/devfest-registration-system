import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useTicketTypesQuery } from "@/client";

import { useEffect, useState } from "react";
import { cn, currencyFormatter } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

export default function MinimalRichTicketFormRenderer({ value, onChange }: FormFieldRendererProps) {
    const { data } = useTicketTypesQuery();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (typeof data !== 'undefined' && data.length === 1) {
            onChange(data[0].id);
        }
    }, [data]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {data?.find(t => t.id === value)?.name ?? "Select a ticket"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[30rem] md:w-[42rem] p-0">
                <Command>
                    <CommandInput placeholder="Search ticket type..." />
                    <CommandEmpty>No ticket type found.</CommandEmpty>
                    <CommandGroup>
                        {data?.map((ticket) => (
                            <CommandItem
                                key={`ticket_${ticket.id}`}
                                value={ticket.id}
                                onSelect={(currentValue) => {
                                    onChange(currentValue);
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === ticket.id ? "opacity-100" : "opacity-0"
                                    )}
                                />

                                <div className="w-full flex justify-between">
                                    <p>{ticket.name}</p>
                                    <p className="font-bold">{currencyFormatter.format(ticket.price)}</p>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
