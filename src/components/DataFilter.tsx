import { FilterExpr, FilterOp, eq, ops } from "@/lib/pb_filters";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { CommandLoading } from "cmdk";
import { LoaderIcon } from "lucide-react";
import { Collections } from "@/pocketbase-types";
import { useQuery } from "@tanstack/react-query";
import { RegistrationField, pb } from "@/client";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "./ui/select";

export interface DataFilterValue<T = FilterOp> {
    type: string
    values: string[]
    expr: FilterExpr<T>
}

export default function DataFilter({ collection, value = [], onChange }: {
    collection: `${Collections}`
    value: DataFilterValue[]
    onChange: (v: DataFilterValue[]) => void
}) {
    // const [refs, setRefs] = useState<Record<string, RefObject<HTMLDivElement>>>({});
    const [openedFilter, setOpenedFilter] = useState(-2);

    const { data, isLoading } = useQuery([collection, 'fields'], () => {
        return pb.send<RegistrationField[]>(`/api/admin/fields/${collection}`, { });
    });

    const fields = useMemo(() => {
        if (!data) {
            return [];
        }

        return data
            .map(f => f.type === 'relation' && f.options.expand ?
                (f.options.fields as RegistrationField[])
                    .map(cf => ({
                        ...cf,
                        name: `${f.name}.${cf.name}`
                    })) : f)
            .flat();
    }, [data]);

    return (
        <div className="flex items-start space-x-1">
            <p className="text-sm text-muted-foreground pt-3">Filters</p>

            <div className="flex flex-wrap">
                {value?.map((v, idx) => (
                    <div key={`filter_${idx}`} className="p-1">
                        <Popover open={openedFilter === idx} onOpenChange={op => setOpenedFilter(op ? idx : -2)}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {v.expr.lhs as string} <span className="text-gray-400 px-2">{ops[v.expr.op]}</span> {v.expr.rhs as string}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" side="bottom" align="start">
                                <Command>
                                    <CommandList>
                                        <CommandGroup>
                                            <div className="p-2 flex flex-col items-start space-y-2">
                                                <div className="flex space-x-2 items-center">
                                                    <Select value={v.expr.op} onValueChange={(newOp) => {
                                                        onChange(value.map((vv, vIdx) => (
                                                            vIdx === idx ? {
                                                                ...vv,
                                                                expr: {
                                                                    ...vv.expr,
                                                                    op: newOp as FilterOp
                                                                }
                                                            } : vv
                                                        )));
                                                    }}>
                                                        <SelectTrigger className="w-[80px]">
                                                            <SelectValue placeholder="Operator">
                                                                {ops[v.expr.op]}
                                                            </SelectValue>
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {Object.entries(ops)
                                                                .filter(([op]) => !['and', 'or', 'par'].includes(op) && !op.includes('any'))
                                                                .map(([op, sym]) =>
                                                                    <SelectItem key={`op_${op}`} value={op}>
                                                                        {sym}
                                                                    </SelectItem>)}
                                                        </SelectContent>
                                                    </Select>

                                                    {v.values ? (
                                                        <Select value={JSON.parse(v.expr.rhs as string)} onValueChange={(newValue) => {
                                                            onChange(value.map((vv, vIdx) => (
                                                                vIdx === idx ? {
                                                                    ...vv,
                                                                    expr: {
                                                                        ...vv.expr,
                                                                        rhs: JSON.stringify(newValue)
                                                                    }
                                                                } : vv
                                                            )));
                                                        }}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Values">
                                                                    {JSON.parse(v.expr.rhs as string) ?? 'Select...'}
                                                                </SelectValue>
                                                            </SelectTrigger>

                                                            <SelectContent>
                                                                {v.values.map((value) =>
                                                                    <SelectItem key={`${idx}_${value}`} value={value}>
                                                                        {value}
                                                                    </SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input type={v.type === 'number' ? 'number' : 'text'}
                                                            value={typeof JSON.parse(v.expr.rhs as string) === 'object'
                                                                ? v.expr.rhs as string
                                                                : JSON.parse(v.expr.rhs as string)}
                                                            onChange={(evt) => {
                                                                onChange(value.map((vv, vIdx) => (
                                                                    vIdx === idx ? {
                                                                        ...vv,
                                                                        expr: {
                                                                            ...vv.expr,
                                                                            rhs: JSON.stringify(evt.currentTarget.value)
                                                                        }
                                                                    } : vv
                                                                )));
                                                            }} />
                                                    )}
                                                </div>

                                                <Button
                                                    onClick={() => {
                                                        const left = value.slice(0, idx);
                                                        const right = value.slice(
                                                            Math.min(idx + 1, value.length - 1),
                                                            idx === value.length - 1 ? value.length - 1 : value.length
                                                        );

                                                        console.log(left, right);

                                                        onChange(
                                                            left.length > 0 && right.length > 0
                                                                ? left.concat(...right)
                                                                : right.length > 0
                                                                ? right
                                                                : left
                                                        );
                                                    }}
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm">
                                                    Remove
                                                </Button>
                                            </div>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                ))}

                <div className="p-1">
                    <Popover open={openedFilter === -1} onOpenChange={(op) => setOpenedFilter(op ? -1 : -2)}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                + Add filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" side="right" align="start">
                            <Command>
                                <CommandInput placeholder="Search fields..." />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    {isLoading && <CommandLoading>
                                        <div className="w-full flex py-8 justify-center">
                                            <LoaderIcon className="text-gray-500 animate-spin" />
                                        </div>
                                    </CommandLoading>}
                                    <CommandGroup>
                                        {fields.map(field => (
                                            <CommandItem
                                                key={`field_${field.title}`}
                                                onSelect={(fieldName) => {
                                                    const selectedField = fields.find(f => f.name === fieldName);
                                                    if (!selectedField) return;

                                                    onChange(value.concat({
                                                        type: selectedField.type,
                                                        values: field.options.values,
                                                        expr: eq(fieldName, '')!
                                                    } as DataFilterValue));

                                                    setOpenedFilter(value.length);
                                                }}
                                            >
                                                <span>{field.name}</span>
                                            </CommandItem>
                                        ))}
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
