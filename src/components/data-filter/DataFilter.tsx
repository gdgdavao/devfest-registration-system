import { COMPARISON_OPS, ComparisonOp, eq, getSymbolByOp } from "@nedpals/pbf";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { CommandLoading } from "cmdk";
import { LoaderIcon } from "lucide-react";
import { Collections } from "@/pocketbase-types";
import { RegistrationField, useFieldsQuery } from "@/client";
import { useMemo, useState } from "react";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { DataFilterValue } from "./types";
import SelectDataFilterValue from "./SelectDataFilterValue";
import TextDataFilterValue from "./TextDataFilterValue";
import RemoteSelectDataFilterValue from "./RemoteSelectDataFilterValue";
import BooleanSelectDataFilterValue from "./BooleanDataFilterValue";

function mapFields(f: RegistrationField, parentName?: string): RegistrationField | (RegistrationField[]) {
    const name = parentName ? `${parentName}.${f.name}` : f.name;
    if (f.type === 'relation' && f.options.fields) {
        return (f.options.fields as RegistrationField[])
            .map(f => mapFields(f, name)).flat();
    }
    return {
        ...f,
        name
    };
}

export default function DataFilter({ collection, expand = [], hidden = [], value = [], onChange }: {
    collection: `${Collections}`
    value: DataFilterValue[]
    expand?: string[]
    hidden?: string[]
    onChange: (v: DataFilterValue[]) => void
}) {
    const [openedFilter, setOpenedFilter] = useState(-2);
    const { data, isLoading } = useFieldsQuery(collection, { expand, hidden });

    const fields = useMemo(() => {
        if (!data) {
            return [];
        }

        return data
            .map(f => mapFields(f))
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
                                    {v.field} <span className="text-gray-400 px-2">{getSymbolByOp(v.op)}</span> {`${v.value}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" side="bottom" align="start">
                                <Command>
                                    <CommandList>
                                        <CommandGroup>
                                            <div className="p-2 flex flex-col items-start space-y-2">
                                                <div className="flex space-x-2 items-center">
                                                    <Select value={v.op} onValueChange={(newOp) => {
                                                        onChange(value.map((vv, vIdx) => (
                                                            vIdx === idx ? {
                                                                ...vv,
                                                                op: newOp as ComparisonOp
                                                            } : vv
                                                        )));
                                                    }}>
                                                        <SelectTrigger className="w-[80px]">
                                                            <SelectValue placeholder="Operator">
                                                                {getSymbolByOp(v.op)}
                                                            </SelectValue>
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {Object.entries(COMPARISON_OPS)
                                                                .filter(([op]) => !op.includes('any'))
                                                                .map(([op, sym]) =>
                                                                    <SelectItem key={`op_${op}`} value={op}>
                                                                        {sym}
                                                                    </SelectItem>)}
                                                        </SelectContent>
                                                    </Select>

                                                    {v.meta?.values ? (
                                                        <SelectDataFilterValue
                                                            value={v.value as string}
                                                            values={v.meta.values}
                                                            onChange={(v) => {
                                                                onChange(value.map((vv, vIdx) => (
                                                                    vIdx === idx ? {
                                                                        ...vv,
                                                                        value: v
                                                                    } : vv
                                                                )));
                                                            }} />
                                                    ) : (v.meta?.type === 'relation' && v.meta?.collectionId) ? (
                                                        <RemoteSelectDataFilterValue
                                                            collectionId={v.meta.collectionId}
                                                            value={v.value as string}
                                                            onChange={(v) => {
                                                                onChange(value.map((vv, vIdx) => (
                                                                    vIdx === idx ? {
                                                                        ...vv,
                                                                        value: v
                                                                    } : vv
                                                                )));
                                                            }} />
                                                    ) : v.meta?.type === 'bool' ? (
                                                        <BooleanSelectDataFilterValue
                                                            value={v.value as string}
                                                            onChange={(v) => {
                                                                onChange(value.map((vv, vIdx) => (
                                                                    vIdx === idx ? {
                                                                        ...vv,
                                                                        value: v
                                                                    } : vv
                                                                )));
                                                            }} />
                                                    ) : (
                                                        <TextDataFilterValue
                                                            type={v.meta?.type ?? 'text'}
                                                            value={v.value as string}
                                                            onChange={(v) => {
                                                                onChange(value.map((vv, vIdx) => (
                                                                    vIdx === idx ? {
                                                                        ...vv,
                                                                        value: v
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
                                                        ...eq(fieldName, '')!,
                                                        meta: {
                                                            type: selectedField.type,
                                                            values: field.options.values,
                                                            collectionId: field.options.collectionId,
                                                        }
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
