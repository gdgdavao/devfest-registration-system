import { useEffect, useState } from "react";
import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useFormContext } from "react-hook-form";
import { useBundlesQuery } from "@/client";
import parseHtml, { Element, domToReact } from "html-react-parser";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

const currentFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
});

export default function RichBundleFormRenderer({
    name,
    onChange,
}: FormFieldRendererProps) {
    const [selectedBundle, setSelectedBundle] = useState("");
    const form = useFormContext();
    const { data } = useBundlesQuery();

    useEffect(() => {
        onChange(selectedBundle);
    }, [name, selectedBundle, form]);

    return (
        <div className="flex flex-row space-x-2">
            {data?.map((bundle) => (
                <Card
                    key={`bundle_${bundle.id}`}
                    className="flex flex-col w-1/3"
                >
                    <CardHeader>
                        <CardTitle>{bundle.title}</CardTitle>
                        <CardDescription>
                            {parseHtml(bundle.description)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-sm">This includes:</p>
                        <div className="text-sm">
                            {parseHtml(bundle.includes, {
                                replace(domNode) {
                                    if (
                                        domNode instanceof Element &&
                                        domNode.attribs &&
                                        domNode.tagName === "ul"
                                    ) {
                                        return (
                                            <ul className="list-disc pl-4">
                                                {domToReact(domNode.children)}
                                            </ul>
                                        );
                                    }
                                },
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto flex flex-col">
                        <div className="w-full pb-4">
                            <p className="text-sm text-gray-400">Price</p>
                            <p className="text-lg font-semibold">
                                {currentFormatter.format(bundle.price)}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant={
                                bundle.id === selectedBundle
                                    ? "secondary"
                                    : "default"
                            }
                            onClick={() => setSelectedBundle(bundle.id)}
                            className="w-full"
                        >
                            {bundle.id === selectedBundle
                                ? "Selected"
                                : "Select"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
