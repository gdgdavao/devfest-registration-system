import { RegistrationRecord } from "@/client";
import { useRegistrationForm } from "@/registration-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "./ui/form";
import FormFieldRenderer, { FormFieldRendererProps } from "./FormFieldRenderer";
import TopicInterestFormRenderer from "./form_renderers/TopicInterestFormRenderer";
import DefaultAddonsFormRenderer from "./form_renderers/DefaultAddonsFormRenderer";
import { ReactNode, useEffect, useRef } from "react";
import JsonCheckboxFormRenderer from "./form_renderers/JsonCheckboxFormRenderer";
import RichTicketFormRenderer from "./form_renderers/RichTicketsFormRenderer";
import { FormDetailsFormGroupOptions } from "@/pocketbase-types";

export type FormGroup = "all" | `${FormDetailsFormGroupOptions}`;

export default function RegistrationForm({
    data: existingData,
    group = "all",
    noLabel = false,
    customComponents = {},
    children
}: {
    data?: RegistrationRecord;
    asChild?: boolean;
    group?: FormGroup;
    noLabel?: boolean;
    children?: ReactNode;
    customComponents?: Partial<
        Record<keyof RegistrationRecord | string, React.FC<FormFieldRendererProps>>
    >;
}) {
    const {
        form,
        resetFormToDefault,
        fields: { data },
    } = useRegistrationForm();

    const prev = useRef<RegistrationRecord | undefined>();

    useEffect(() => {
        if (prev.current === existingData) {
            return;
        }

        if (existingData) {
            form.reset(existingData);
        } else {
            resetFormToDefault();
        }

        prev.current = existingData;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingData]);

    return (
        <div className="w-full flex flex-col space-y-2">
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
                                        "merch_sensing_data.preferred_offered_merch":
                                            JsonCheckboxFormRenderer,
                                        "merch_sensing_data.merch_spending_limit":
                                            JsonCheckboxFormRenderer,
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

            {children}
        </div>
    );
}
