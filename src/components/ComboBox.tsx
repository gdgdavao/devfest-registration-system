import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import IconDown from "~icons/material-symbols/keyboard-arrow-down-rounded";
import IconCheck from "~icons/material-symbols/check-small-rounded";

export default function ComboBox({ onChange, value = [], values, labels }: {
    onChange: (v: string[]) => void
    value: string[], values: string[]
    labels: Record<string, string>
}) {
    return <Popover>
        <PopoverTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground"
            )}>
            {value.length > 0 ? value.join(', ') : "Select..."}
            <IconDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-[670px] w-[670px] p-0">
            <Command>
                <CommandInput placeholder="Search add-ons..." />
                <CommandEmpty>No add-ons found.</CommandEmpty>
                <CommandGroup>
                {values.map(v => (
                    <CommandItem
                        key={`select_combo_${v}`}
                        onSelect={(v) => {
                            onChange(
                                value.includes(v) ?
                                value.filter((pv: string) => pv !== v) :
                                value.concat(v));
                        }}
                        value={v}>
                        <IconCheck
                            className={cn(
                                "mr-2 h-4 w-4",
                                value.includes(v) ? "opacity-100" : "opacity-0"
                            )} />
                        {labels[v] ?? v}
                    </CommandItem>
                ))}
                </CommandGroup>
            </Command>
        </PopoverContent>
    </Popover>;
}
