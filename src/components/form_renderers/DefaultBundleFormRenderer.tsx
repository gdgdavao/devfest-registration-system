import { useBundlesQuery } from "@/client";
import { FormFieldRendererProps } from "../FormFieldRenderer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function DefaultBundleFormRenderer({ name, ...props }: FormFieldRendererProps) {
    const { data } = useBundlesQuery();

    return <Select
        defaultValue={data?.[0].id} 
        onValueChange={props.onChange}
        defaultOpen={props.value}
        disabled={props.disabled}>
        <SelectTrigger>
            <SelectValue placeholder={data?.[0].title ?? ''} />
        </SelectTrigger>
        <SelectContent>
            {(data ?? []).map(bundle => (
                <SelectItem
                    key={`registration_${name}_select_${bundle.id}`}
                    value={bundle.id}>{bundle.title}</SelectItem>
            ))}
        </SelectContent>
    </Select>
}