import { RegistrationRecord, handleFormServerSideError } from "@/client";
import { useRegistrationForm } from "@/registration-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "./ui/form";
import FormFieldRenderer, { FormFieldRendererProps } from "./FormFieldRenderer";
import { Button } from "./ui/button";
import TopicInterestFormRenderer from "./form_renderers/TopicInterestFormRenderer";
import DefaultAddonsFormRenderer from "./form_renderers/DefaultAddonsFormRenderer";
import { useEffect } from "react";
import RichTicketFormRenderer from "./form_renderers/RichTicketsFormRenderer";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";

export type FormGroup = "all" | `${FormDetailsFormGroupOptions}`;

export default function RegistrationForm({
    data: existingData,
    group = "all",
    noLabel = false,
    onSubmit,
    customComponents = {},
}: {
    data?: RegistrationRecord;
    group?: FormGroup;
    onSubmit?: (
        record: RegistrationRecord,
        onError: (err: unknown) => void
    ) => void;
    noLabel?: boolean,
    customComponents?: Partial<
        Record<keyof RegistrationRecord, React.FC<FormFieldRendererProps>>
    >;
}) {
    const {
        form,
        resetFormToDefault,
        fields: { data },
    } = useRegistrationForm();
    const onFormSubmit = (data: RegistrationRecord) =>
        onSubmit?.(data, (err) =>
            handleFormServerSideError(err, (errors) => {
                for (const fieldName in errors) {
                    form.setError(fieldName as never, errors[fieldName]);
                }
            })
        );

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
            <form
                onSubmit={form.handleSubmit(onFormSubmit)}
                className="w-full flex flex-col space-y-2"
            >
                {(data ?? []).filter(f => group !== 'all' ? f.group === group : true).map((field) => (
                    <FormField
                        control={form.control}
                        name={field.name as never}
                        key={`registration_${field.name}`}
                        render={({ field: ofield }) => (
                            <FormItem>
                                {!noLabel && <FormLabel>{field.title}</FormLabel>}
                                <FormControl>
                                    <FormFieldRenderer
                                        {...ofield}
                                        field={field}
                                        customComponents={{
                                            ticket: RichTicketFormRenderer,
                                            topic_interests:
                                                TopicInterestFormRenderer,
                                            addons: DefaultAddonsFormRenderer,
                                            ...customComponents,
                                        }}
                                    />
                                </FormControl>
                                {field.description && (
                                    <FormDescription>
                                        {field.description}
                                    </FormDescription>
                                )}
                            </FormItem>
                        )}
                    />
                ))}
                {onSubmit && <Button type="submit">Submit</Button>}
            </form>
        </Form>
    );
}
