/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { RegistrationField } from "@/client";
import {
    ControllerRenderProps,
    FieldValues,
    useFormContext,
} from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import ComboBox from "./ComboBox";

export type FormFieldRendererProps<T extends FieldValues = FieldValues> = {
    field: RegistrationField;
} & Omit<ControllerRenderProps<T, any>, "ref">;

export default function FormFieldRenderer<T extends FieldValues = FieldValues>({
    field,
    rename,
    customComponents,
    ...props
}: {
    field: RegistrationField;
    rename?: Record<string, string>;
    customComponents?: Record<string, FC<FormFieldRendererProps>>;
} & Omit<ControllerRenderProps<T, any>, "ref">) {
    const name = field.name;
    const registeredName = rename?.[name] ?? name;
    const form = useFormContext();
    const placeholder = (field.options.placeholder as string | undefined) ?? '';

    if (customComponents && customComponents[name]) {
        const CustomFormRenderer = customComponents[name];
        return <CustomFormRenderer field={{...field, name: registeredName}} {...props} />;
    }

    if (field.type === "select") {
        const labels = (field.options.labels as Record<string, string>) ?? {};
        const values = field.options.values as string[];

        if (Array.isArray(props.value)) {
            return <ComboBox labels={labels} values={values} {...props} />;
        }

        return (
            <Select
                name={name}
                onValueChange={props.onChange}
                defaultValue={props.value}
                disabled={props.disabled}
            >
                <SelectTrigger className="[&>*:first-child]:capitalize">
                    <SelectValue
                        placeholder={
                            labels[values[0]] ?? values[0] ?? "Select..."
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {values.map((v) => (
                        <SelectItem
                            key={`registration_${name}_select_${v}`}
                            value={v}
                            className="capitalize"
                        >
                            {labels[v] ?? v}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    if (field.type === "relation") {
        if (field.options.fields) {
            return (
                <div className="flex flex-col space-y-4">
                    {(field.options.fields as RegistrationField[]).map(
                        (sfield) => (
                            <FormField
                                key={`${field.name}.${sfield.name}`}
                                control={form.control}
                                name={`${registeredName}_data.${sfield.name}`}
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
                                                    name: `${registeredName}.${sfield.name}`,
                                                }}
                                                customComponents={
                                                    customComponents
                                                }
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
    }

    if (field.type === "email") {
        return <Input type="email" placeholder={placeholder} defaultValue={props.value} {...props} />;
    }

    if (field.type === "bool") {
        return (
            <div className="flex items-center space-x-2">
                <Checkbox
                    checked={props.value}
                    onCheckedChange={props.onChange}
                    id={name}
                />
                <label
                    htmlFor={name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {(field.options.checkbox_label as string) ?? name}
                </label>
            </div>
        );
    }

    return <Input type="text" placeholder={placeholder} defaultValue={props.value} {...props} />;
}
