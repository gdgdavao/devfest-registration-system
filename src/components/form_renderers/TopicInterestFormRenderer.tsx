import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useEffect } from "react";
import { Button } from "../ui/button";

export default function TopicInterestFormRenderer({ onChange, value = {}, field }: FormFieldRendererProps) {
    const topics = (field.options.topics as { key: string, name: string }[]);
    const values = field.options.values as string[];
    const selected = value as Record<string, string>;
    const setSelected = (cb: (s: Record<string, string>) => Record<string, string>) => onChange(cb(selected));

    useEffect(() => {
        if (typeof selected === 'undefined' || Object.keys(selected).length === 0) {
            onChange(topics.map(t => ({ [t.key]: values[0] })).reduce((pv, cv) => {
                return { ...pv, ...cv };
            }, {}))
        }
    }, [value, onChange, selected, topics, values]);

    return (
        <div>
            <div className="flex flex-col">
                {topics.map(topic => (
                    <div key={`topic_${topic.key}`} className="flex flex-row">
                        <div className="w-1/2">
                            {topic.name}
                        </div>

                        <div className="w-1/2 flex flex-row">
                        {values.map((v, i) => (
                            <div key={`topic_${topic.key}_choice_${i}`}>
                                <Button
                                    type="button"
                                    onClick={() => setSelected(s => ({ ...s, [topic.key]: v }))}
                                    variant={selected[topic.key] === v ? 'destructive' : 'default'}
                                    className="py-8">{v}</Button>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
