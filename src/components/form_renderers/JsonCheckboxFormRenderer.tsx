import { FormFieldRendererProps } from "../FormFieldRenderer";
import { FormControl, FormItem, FormLabel } from "../ui/form";
import { Checkbox } from "../ui/checkbox";

export default function JsonCheckboxFormRenderer({ name, value = [], field, onChange }: FormFieldRendererProps) {
    const values = field.options.values as string[];

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
