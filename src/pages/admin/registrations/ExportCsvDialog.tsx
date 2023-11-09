import { RegistrationField, useExportCsvMutation, useFieldsQuery } from "@/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import DataFilter from "@/components/data-filter/DataFilter";
import { DataFilterValue } from "@/components/data-filter/types";
import * as pbf from "@nedpals/pbf";
import { Collections } from "@/pocketbase-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export default function ExportCsvDialog({ collection, filter = [], expand = [], children }: {
    collection: `${Collections}`
    filter?: DataFilterValue[],
    expand?: string[],
    children: ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: exportCsv, isLoading } = useExportCsvMutation();
    const { data: fields } = useFieldsQuery(collection, { expand });

    const form = useForm({
        resolver: joiResolver(Joi.object({
            collection: Joi.string().required(),
            filter: Joi.array(),
            fields: Joi.array(),
        })),
        defaultValues: {
            collection: '' as `${Collections}`,
            filter: [] as DataFilterValue[],
            fields: [] as string[],
        }
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        form.reset({
            collection: collection,
            filter: filter ?? [],
        }, {
            keepTouched: true
        });
    }, [isOpen]);

    const FieldCheckbox = ({ parentKey, f }: {parentKey: string, f: RegistrationField}) => {
        const fieldName = parentKey ? `${parentKey}.${f.name}` : f.name;
        const isRel = f.options.type === 'relation' && !!f.options.fields;

        return (
            <FormField
                key={fieldName}
                control={form.control}
                defaultValue={[]}
                name="fields"
                render={({ field }) => {
                    return (
                        <FormItem
                            key={fieldName}
                            className="flex flex-row items-start py-1"
                        >
                            <div className="space-x-3">
                                <FormControl>
                                    <Checkbox
                                        checked={isRel && field.value?.includes(`${fieldName}.*`) ? true :
                                            field.value.some(fn => fn.startsWith(`${fieldName}.`)) ? 'indeterminate' : false}
                                        onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, `${fieldName}.*`])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== `${fieldName}.*` && !value.startsWith(`${fieldName}.`)
                                                    )
                                                )
                                        }}
                                    />
                                </FormControl>

                                <FormLabel className="font-normal">
                                    {f.title}
                                </FormLabel>
                            </div>

                            {isRel && (
                                <div className="pl-4">
                                    {(f.options.fields as RegistrationField[]).map((sf) => (
                                        <FieldCheckbox parentKey={f.name} f={sf} />
                                    ))}
                                </div>
                            )}
                        </FormItem>
                    )
                }}
            />
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(state) => {
            setIsOpen(state);
            setTimeout(() => (document.body.style.pointerEvents = ""), 100);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(({ filter, ...payload }) => {
                        exportCsv({
                            ...payload,
                            filter: pbf.stringify(filter.length > 1 ? pbf.and(...filter) : filter[0]),
                        });
                    })}>
                        <DialogHeader>
                            <DialogTitle>Export CSV</DialogTitle>

                            <FormField
                                control={form.control}
                                name="filter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Filter</FormLabel>
                                        <FormControl>
                                            <DataFilter
                                                collection="registrations"
                                                onChange={field.onChange}
                                                value={field.value} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="fields"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Fields to export</FormLabel>
                                        <ScrollArea className="h-[300px]">
                                            {fields?.map(f => (
                                                <FieldCheckbox parentKey="" f={f} />
                                            ))}
                                        </ScrollArea>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                        </DialogHeader>
                        <DialogFooter className="pt-4">
                            <Button
                                disabled={isLoading}
                                type="submit"
                                onClick={() => form.trigger()}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Exporting' : 'Export'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
