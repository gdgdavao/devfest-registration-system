import { useBundlesQuery, useRegistrationMutation } from "@/client";
import parseHtml, { Element, domToReact } from 'html-react-parser';
import { useEffect, useState } from "react";
import { useFormContext } from "@/form-context";
import { useRegistrationForm } from "@/registration";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FormRenderer, { FormRendererProps } from "@/components/formrenderer";
import TopicInterestFormRenderer from "@/components/form-renderers/TopicInterestFormRenderer";

// TODO: make payments required!

const currentFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BundleFormRenderer({ name }: FormRendererProps) {
    const [selectedBundle, setSelectedBundle] = useState('');
    const form = useFormContext();
    const { data } = useBundlesQuery();
    useEffect(() => {
        form.set(name, selectedBundle)
    }, [name, selectedBundle, form]);

    return (
        <div className="flex flex-row space-x-2">
            {data?.map(bundle => (
                <Card key={`bundle_${bundle.id}`} className="flex flex-col w-1/3">
                    <CardHeader>
                        <CardTitle>{bundle.title}</CardTitle>
                        <CardDescription>{parseHtml(bundle.description)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-sm">This includes:</p>
                        <div className="text-sm">
                            {parseHtml(bundle.includes, {
                                replace(domNode) {
                                    if (domNode instanceof Element && domNode.attribs && domNode.tagName === "ul") {
                                        return <ul className="list-disc pl-4">
                                            {domToReact(domNode.children)}
                                        </ul>
                                    }
                                },
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto flex flex-col">
                        <div className="w-full pb-4">
                            <p className="text-sm text-gray-400">Price</p>
                            <p className="text-lg font-semibold">{currentFormatter.format(bundle.price)}</p>
                        </div>

                        <Button
                            variant={bundle.id === selectedBundle ? 'secondary' : 'default'}
                            onClick={() => setSelectedBundle(bundle.id)}
                            className="w-full">
                            {bundle.id === selectedBundle ? 'Selected' : 'Select'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default function Home() {
    const {
        FormProvider,
        formData,
        registrationType,
        fieldsQuery: { data, refetch: refetchFields }
    } = useRegistrationForm();
    const { mutate: submitForm } = useRegistrationMutation();

    useEffect(() => {
        refetchFields();
    }, [registrationType, refetchFields]);

    return (
        // TODO: use Form component
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                const fdFromForm = new FormData(ev.currentTarget);

                formData.forEach((v, k) => {
                    fdFromForm.set(k, v);
                });

                submitForm(fdFromForm);
            }}
            className="max-w-3xl px-3 mx-auto flex flex-col space-y-2">
            <FormProvider>
                {data?.map(field => (
                    <div key={`registration_${field.name}`} className="py-4">
                        <Label htmlFor={field.name}>{field.title}</Label>
                        <FormRenderer
                            field={field}
                            customComponents={{
                                "topic_interests": TopicInterestFormRenderer,
                                "selected_bundle": BundleFormRenderer
                            }} />
                    </div>
                ))}
            </FormProvider>

            <Button type="submit">Submit</Button>
        </form>
    );
}
