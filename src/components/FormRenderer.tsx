import { ChangeEvent, FC } from "react"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { FormContext, useFormContext } from "@/form-context"
import { RegistrationField } from "@/client"

export type FormRendererProps = { name: string, field: RegistrationField };

export default function FormRenderer({ field, customComponents }: {
    field: RegistrationField,
    customComponents?: Record<string, FC<FormRendererProps>>
}) {
    const name = field.name;
    const form = useFormContext();
    const defaultChangeHandler = (ev: ChangeEvent<HTMLInputElement>) => { form.set(name, ev.currentTarget.value) };

    if (customComponents && customComponents[name]) {
        const CustomFormRenderer = customComponents[name];
        return <CustomFormRenderer name={name} field={field} />
    }

    if (field.type === "select") {
        const labels = (field.options.labels as Record<string, string>) ?? {};
        const values = field.options.values as string[];
        return <Select
            defaultValue={values[0]} 
            onValueChange={(value) => { form.set(name, value); }}>
            <SelectTrigger>
                <SelectValue placeholder={(labels[values[0]] ?? values[0]) ?? ''} />
            </SelectTrigger>
            <SelectContent>
                {values.map(v => (
                    <SelectItem
                        key={`registration_${name}_select_${v}`}
                        value={v}>{labels[v] ?? v}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    }

    if (field.type === "relation") {
        if (field.options.fields) {
            return <FormContext.Provider value={{
                set(key: string, value: string) {
                    let payload: Record<string, unknown> = {};
                    const rawPayload = form.get(name + '_data');
                    if (rawPayload) {
                        payload = JSON.parse(rawPayload);
                        if (typeof payload !== "object") {
                            payload = {};
                        }
                    }

                    payload![key] = value;
                    form.set(name + '_data', JSON.stringify(payload));
                },
                get(key: string) {
                    let payload: Record<string, unknown> = {};
                    const rawPayload = form.get(name + '_data');
                    if (rawPayload) {
                        payload = JSON.parse(rawPayload);
                        if (typeof payload !== "object") {
                            payload = {};
                        }
                    }
                    return `${payload[key]}`;
                }
            }}>
                <div className="flex flex-col">
                    {(field.options.fields as RegistrationField[]).map(sfield => (
                        <div key={`registration_${field.name}_${sfield.name}`} className="py-4">
                            <Label htmlFor={sfield.name}>{sfield.title}</Label>
                            <FormRenderer
                                field={sfield}
                                customComponents={customComponents} />
                        </div>
                    ))}
                </div>
            </FormContext.Provider>
        }

        return <Input
            onChange={defaultChangeHandler}
            type="text" id={name} />
    }

    if (field.type === "email") {
        return <Input
            onChange={defaultChangeHandler}
            type="email" id={name} />
    }

    if (field.type === "bool") {
        return <div className="flex items-center space-x-2">
            <Checkbox
                onCheckedChange={(checked) => { form.set(name, typeof checked === "string" ? checked : `${checked}`) }}
                id={name} />
            <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {(field.options.checkbox_label as string) ?? name}
            </label>
        </div>
    }

    return <Input
        onChange={defaultChangeHandler}
        type="text" id={name} />
}
