import FormFieldRenderer, { FormFieldRendererProps } from "../FormFieldRenderer";
import { RegistrationField, pb, useAddonsQuery } from "@/client";
import parseHtml, { domToReact, Element } from 'html-react-parser';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { AddonOrdersRecord, AddonsResponse } from "@/pocketbase-types";
import { currencyFormatter } from "@/lib/utils";
import { useSubtotal } from "@/registration-form";

function SubtotalDisplay() {
    const { subtotal } = useSubtotal();
    return (
        <Card className="sticky bottom-[80px] mt-4 mb-8">
            <CardContent>
                <div className="flex items-center pt-6 justify-between">
                    <p className="text-xl text-gray-600">Subtotal</p>
                    <p className="text-2xl font-semibold">{currencyFormatter.format(subtotal)}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RichAddonsFormRenderer({ onChange, value = [], field }: FormFieldRendererProps) {
    const form = useFormContext();
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
            <div className="flex flex-row flex-wrap -mx-1">
                {data?.map(addon => (
                    <div key={`addon_${addon.id}`} className="p-1 w-1/2 md:w-1/3">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <div className="pb-4">
                                    <AspectRatio ratio={4/3}>
                                        <img
                                            src={pb.files.getUrl(addon, addon.cover_image)}
                                            className="rounded-md object-cover h-full w-full border"
                                            alt={addon.title} />
                                    </AspectRatio>
                                </div>

                                <CardTitle>{addon.title}</CardTitle>
                                {parseHtml(addon.description, {
                                    replace: (domNode) => {
                                        if (domNode instanceof Element && domNode.attribs) {
                                            return <CardDescription>{domToReact(domNode.children)}</CardDescription>;
                                        }
                                    }
                                })}
                            </CardHeader>
                            {(isIncluded(addon.id) && (addon.customization_options as RegistrationField[])) && (
                                <CardContent className="flex flex-col space-y-2">
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
                                </CardContent>
                            )}
                            <CardFooter className="mt-auto flex flex-col">
                                <div className="w-full pb-4">
                                    <p className="text-sm text-gray-400">Price</p>
                                    <p className="text-lg font-semibold">{currencyFormatter.format(addon.price)}</p>
                                </div>

                                <Button
                                    type="button"
                                    variant={isIncluded(addon.id) ? 'secondary' : 'default'}
                                    onClick={() => toggleAddon(addon)}
                                    className="w-full">
                                    {isIncluded(addon.id) ? 'Remove' : 'Select'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>

            <SubtotalDisplay />
        </div>
    )
}
