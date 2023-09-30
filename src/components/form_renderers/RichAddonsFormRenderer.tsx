import { FormFieldRendererProps } from "../FormFieldRenderer";
import { pb, useAddonsQuery, useTicketTypeQuery } from "@/client";
import parseHtml, { domToReact, Element } from 'html-react-parser';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

const currentFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

function SubtotalDisplay({ value }: { value: string[] }) {
    const { data: addOns } = useAddonsQuery();
    const form = useFormContext();
    const { data: selectedTicket } = useTicketTypeQuery(form.getValues('ticket'));

    const total = useMemo(() => {
        let total = 0;
        if (selectedTicket) {
            total += selectedTicket.price;
        }

        if (addOns) {
            const totalAddonPrices = addOns
                .filter(a => value.includes(a.id))
                .reduce((pv, cv) => pv + cv.price, 0) ?? 0;
            total += totalAddonPrices;
        }
        return total;
    }, [value, selectedTicket, addOns]);

    return (
        <Card className="sticky bottom-[80px] mt-4 mb-8">
            <CardContent>
                <div className="flex items-center pt-6 justify-between">
                    <p className="text-xl text-gray-600">Subtotal</p>
                    <p className="text-2xl font-semibold">{currentFormatter.format(total)}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RichAddonsFormRenderer({ value = [], onChange }: FormFieldRendererProps) {
    const { data } = useAddonsQuery();

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
                            <CardFooter className="mt-auto flex flex-col">
                                <div className="w-full pb-4">
                                    <p className="text-sm text-gray-400">Price</p>
                                    <p className="text-lg font-semibold">{currentFormatter.format(addon.price)}</p>
                                </div>

                                <Button
                                    type="button"
                                    variant={value.includes(addon.id) ? 'secondary' : 'default'}
                                    onClick={() => onChange(value.includes(addon.id) ? value.filter((id: string) => id !== addon.id) : value.concat(addon.id))}
                                    className="w-full">
                                    {value.includes(addon.id) ? 'Remove' : 'Select'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>

            <SubtotalDisplay value={value} />
        </div>
    )
}
