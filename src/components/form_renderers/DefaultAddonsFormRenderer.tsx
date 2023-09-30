import { useAddonsQuery } from "@/client";
import FormFieldRenderer, { FormFieldRendererProps } from "../FormFieldRenderer";

// TODO: fix this
export default function DefaultAddonsFormRenderer({ name, ...props }: FormFieldRendererProps) {
    const { data } = useAddonsQuery();

    return <FormFieldRenderer
        {...props}
        name={name}
        field={{
            name,
            title: 'Addons',
            description: '',
            type: 'select',
            options: {
                values: (data ?? []).map(addon => addon.id),
                labels: (data ?? []).map(addon => [addon.id, addon.title])
                    .reduce((pv, cv) => { pv[cv[0]] = cv[1]; return pv; }, {} as Record<string, string>)
            }
        }} />
}
