import { FormFieldRendererProps } from "../FormFieldRenderer";
import { FormControl, FormItem, FormLabel } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { useEffect } from "react";

export default function JsonCheckboxFormRenderer({ name, field, onChange, ...props }: FormFieldRendererProps) {
    const values = field.options.values as string[];
    const value = props.value ?? [];

    useEffect(() => {
        if (!props.value) {
            onChange([]);
        }
    }, []);

    return <>
        {(values ?? []).map((v) => (
            <FormItem
                key={`${name}_${v}`}
                className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                    <Checkbox
                            checked={value.includes(v)}
                            onCheckedChange={(checked) => {
                                if (field.options.maxSelect === 1) {
                                    return onChange(v);
                                }

                                return checked
                                    ? onChange(value.concat(v))
                                    : onChange(value.filter((val: string) => val !== v))
                            }} />
                </FormControl>
                <FormLabel>{v}</FormLabel>
            </FormItem>
        ))}
    </>
}
