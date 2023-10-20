import FormFieldRenderer, { FormFieldRendererProps } from "../FormFieldRenderer";
import { RegistrationField, useAddonsQuery } from "@/client";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { AddonOrdersRecord, AddonsResponse } from "@/pocketbase-types";
import { currencyFormatter } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ReactNode, useState } from "react";
import { Cog } from "lucide-react";

function AddonCustomizationOptionsDialog({ field, getOrderIdx, addon, children }: {
    field: RegistrationField
    getOrderIdx: (id: string) => string
    addon: AddonsResponse
    children: ReactNode
}) {
    const form = useFormContext();
    const [isOpen, setIsOpen] = useState(false);

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{addon.title} Options</DialogTitle>

                {(addon.customization_options as RegistrationField[]).map(
                    (sfield) => (
                        <FormField
                            key={`${field.name}.${getOrderIdx(addon.id)}.preferences.${sfield.name}`}
                            name={`${field.name}.${getOrderIdx(addon.id)}.preferences.${sfield.name}`}
                            control={form.control}
                            render={({ field: fieldProps }) => (
                                <FormItem>
                                    <FormLabel className="font-medium">
                                        {sfield.title}
                                    </FormLabel>
                                    <FormControl>
                                        <FormFieldRenderer
                                            field={{
                                                ...sfield,
                                                name: `${field.name}.${getOrderIdx(addon.id)}.preferences.${sfield.name}`,
                                            }}
                                            {...fieldProps} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )
                )}
            </DialogHeader>
        </DialogContent>
    </Dialog>

}

export default function MinimalRichAddonsFormRenderer({ onChange, value = [], field }: FormFieldRendererProps) {
    const { data } = useAddonsQuery();
    const getOrderIdx = (addonId: string) => value.findIndex((a: AddonOrdersRecord) => a.addon === addonId);
    const isIncluded = (addonId: string) => {
        if (!data) return false;
        return getOrderIdx(addonId) !== -1;
    };
    const toggleAddon = (addon: AddonsResponse) => {
        if (isIncluded(addon.id)) {
            return onChange(value.filter((a: AddonOrdersRecord) => a.addon !== addon.id));
        }
        onChange(value.concat({
            addon: addon.id
        } as AddonOrdersRecord));
    }

    return (
        <div>
            <div className="flex flex-col space-y-1">
                {data?.map(addon => (
                    <Card key={`addon_${addon.id}`} className="flex flex-col">
                        <CardContent className="flex p-3 items-center justify-between">
                            <div>
                                <p>{addon.title}</p>
                                <p className="text-sm font-semibold">{currencyFormatter.format(addon.price)}</p>
                            </div>
                            <div className="flex space-x-3">
                                {(isIncluded(addon.id) && !!addon.customization_options) && (
                                    <AddonCustomizationOptionsDialog
                                        addon={addon}
                                        field={field}
                                        getOrderIdx={getOrderIdx}>
                                        <Button type="button" className="px-2">
                                            <Cog />
                                        </Button>
                                    </AddonCustomizationOptionsDialog>
                                )}

                                <Button
                                    type="button"
                                    variant={isIncluded(addon.id) ? 'secondary' : 'default'}
                                    onClick={() => toggleAddon(addon)}
                                    className="w-full">
                                    {isIncluded(addon.id) ? 'Remove' : 'Select'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
