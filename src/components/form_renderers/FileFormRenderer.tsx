import { FormFieldRendererProps } from "../FormFieldRenderer";
import { Input } from "../ui/input";

export default function FileFormRenderer({ value, onChange, ...props }: FormFieldRendererProps) {
    return <Input type="file" value={value?.fileName} onChange={(evt) => {
        onChange(evt.target.files?.[0]);
    }} {...props} />
}
