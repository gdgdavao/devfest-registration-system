import { RegistrationField } from "@/client";
import FormFieldRenderer, { FormFieldRendererProps } from "../FormFieldRenderer";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useFormContext } from "react-hook-form";

export default function TransactionReceiptFormRenderer({ field }: FormFieldRendererProps) {
    const form = useFormContext();

    return (
        <div className="flex flex-col space-y-4">
            {(field.options.fields as RegistrationField[]).map((sfield) => (
                <FormField
                    key={`${field.name}.${sfield.name}`}
                    control={form.control}
                    name={`${field.name}.${sfield.name}`}
                    render={({ field: fieldProps }) => (
                        <FormItem>
                            <FormLabel className="font-medium">
                                {sfield.title}
                            </FormLabel>
                            {sfield.description && (
                                <FormDescription>
                                    {sfield.description}
                                </FormDescription>
                            )}
                            <FormControl>
                                <FormFieldRenderer
                                    field={{
                                        ...sfield,
                                        name: `${field.name}.${sfield.name}`,
                                    }}

                                    {...fieldProps}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                )
            )}
        </div>
    );
}
