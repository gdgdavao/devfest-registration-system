import { FilterExpr } from "@/lib/pb_filters";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

export default function DataFilter({ value }: {
    value: FilterExpr[]
    onChange: (v: FilterExpr[]) => void
}) {
    return (
        <div className="flex items-start space-x-4">
            <p className="text-sm text-muted-foreground pt-4">Filters</p>

            <div className="flex flex-wrap">
                <div className="px-4 py-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-[150px] justify-start"
                            >
                                {/* {selectedStatus ? (
                                <>
                                    <selectedStatus.icon className="mr-2 h-4 w-4 shrink-0" />
                                    {selectedStatus.label}
                                </>
                                ) : ( */}
                                <>+ Set status</>
                                {/* )} */}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" side="right" align="start">
                            <Command>
                                <CommandInput placeholder="Change status..." />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            key={status.value}
                                            onSelect={(value) => {
                                            // setSelectedStatus(
                                            //     statuses.find((priority) => priority.value === value) ||
                                            //     null
                                            // )
                                            // setOpen(false)
                                            }}
                                        >
                                            {/* <status.icon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                status.value === selectedStatus?.value
                                                ? "opacity-100"
                                                : "opacity-40"
                                            )}
                                            /> */}
                                            <span>test</span>
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
