import { RegistrationRecord, handleFormServerSideError } from "@/client";
import { useRegistrationForm } from "@/registration-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./ui/form";
import FormFieldRenderer, { FormFieldRendererProps } from "./FormFieldRenderer";
import { Button } from "./ui/button";
import TopicInterestFormRenderer from "./form_renderers/TopicInterestFormRenderer";
import DefaultAddonsFormRenderer from "./form_renderers/DefaultAddonsFormRenderer";
import { useEffect } from "react";

export default function RegistrationForm({ data: existingData, onSubmit, customComponents = {} }: {
    data?: RegistrationRecord,
    onSubmit: (record: RegistrationRecord, onError: (err: unknown) => void) => void,
    customComponents?: Partial<Record<keyof RegistrationRecord, React.FC<FormFieldRendererProps>>>
}) {
    const { form, resetFormToDefault, fieldsQuery: { data } } = useRegistrationForm();
    const onFormSubmit = (data: RegistrationRecord) => onSubmit(data, (err) => handleFormServerSideError(err, errors => {
        for (const fieldName in errors) {
            form.setError(fieldName as never, errors[fieldName]);
        }
    }));

    useEffect(() => {
        if (existingData) {
            form.reset(existingData);
        } else {
            resetFormToDefault();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}
                className="max-w-3xl px-3 mx-auto flex flex-col space-y-2">
                {data?.map(field => (
                    <FormField
                        control={form.control}
                        name={field.name as never}
                        key={`registration_${field.name}`}
                        render={({ field: ofield }) => (
                            <FormItem>
                                <FormLabel>{field.title}</FormLabel>
                                <FormControl>
                                    <FormFieldRenderer
                                        {...ofield}
                                        field={field}
                                        customComponents={{
                                            "topic_interests": TopicInterestFormRenderer,
                                            "addons": DefaultAddonsFormRenderer,
                                            ...customComponents
                                        }} />
                                </FormControl>
                                {field.description && <FormDescription>
                                    {field.description}
                                </FormDescription>}
                            </FormItem>
                        )}
                    />
                ))}
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
