import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useAddonsQuery } from "@/client";
import parseHtml, { domToReact, Element } from 'html-react-parser';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const currentFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function RichAddonsFormRenderer({ value = [], onChange }: FormFieldRendererProps) {
    const { data } = useAddonsQuery();

    return (
        <div className="flex flex-row space-x-2">
            {data?.map(addon => (
                <Card key={`addon_${addon.id}`} className="flex flex-col w-1/2 md:w-1/3">
                    <CardHeader>
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
            ))}
        </div>
    )
}
