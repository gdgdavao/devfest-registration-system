import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useEffect } from "react";
import LikertSlider from "@/components/form_renderers/LikertSlider";

export default function TopicInterestFormRenderer({
    onChange,
    value = {},
    field,
}: FormFieldRendererProps) {
    const topics = field.options.topics as { key: string; name: string }[];
    const values = (field.options.values as string[]).reverse();
    const selected = value as Record<string, string>;
    const setSelected = (
        cb: (s: Record<string, string>) => Record<string, string>
    ) => onChange(cb(selected));

    useEffect(() => {
        if (
            typeof selected === "undefined" ||
            Object.keys(selected).length === 0
        ) {
            onChange(
                topics
                    .map((t) => ({ [t.key]: values[0] }))
                    .reduce((pv, cv) => {
                        return { ...pv, ...cv };
                    }, {})
            );
        }
    }, [value, onChange, selected, topics, values]);

    return (
        <div>
            <div className="flex flex-col space-y-8">
                {topics.map((topic) => (
                    <div key={`topic_${topic.key}`} className="flex flex-row">
                        <div className="w-1/2">{topic.name}</div>

                        <div className="w-1/2 flex flex-col">
                            <LikertSlider
                                onChange={(v) => setSelected(s => ({ ...s, [topic.key]: v }))}
                                value={selected[topic.key]}
                                values={values} />

                            <div className="mt-2 flex justify-between">
                                <div>😔</div>
                                <div>😐</div>
                                <div>🤔</div>
                                <div>🙂</div>
                                <div>😄</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
