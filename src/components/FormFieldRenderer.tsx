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
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import ComboBox from "./ComboBox";

export type FormFieldRendererProps<T extends FieldValues = FieldValues> = {
    field: RegistrationField;
} & Omit<ControllerRenderProps<T, any>, "ref">;

export default function FormFieldRenderer<T extends FieldValues = FieldValues>({
    field,
    customComponents,
    ...props
}: {
    field: RegistrationField;
    customComponents?: Record<string, FC<FormFieldRendererProps>>;
} & Omit<ControllerRenderProps<T, any>, "ref">) {
    const name = field.name;
    const form = useFormContext();

    if (customComponents && customComponents[name]) {
        const CustomFormRenderer = customComponents[name];
        return <CustomFormRenderer field={field} {...props} />;
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
                <div className="flex flex-col space-y-2">
                    {(field.options.fields as RegistrationField[]).map(
                        (sfield) => (
                            <FormField
                                key={`${field.name}.${sfield.name}`}
                                control={form.control}
                                name={`${field.name}_data.${sfield.name}`}
                                render={({ field: fieldProps }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">
                                            {sfield.title}
                                        </FormLabel>
                                        <FormControl>
                                            <FormFieldRenderer
                                                field={{
                                                    ...sfield,
                                                    name: `${field.name}.${sfield.name}`,
                                                }}
                                                customComponents={
                                                    customComponents
                                                }
                                                {...fieldProps}
                                            />
                                        </FormControl>
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
        return <Input type="email" {...props} />;
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

    return <Input type="text" {...props} />;
}
