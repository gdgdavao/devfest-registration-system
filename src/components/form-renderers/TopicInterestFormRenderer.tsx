import { useFormContext } from "@/form-context";
import { FormRendererProps } from "../formrenderer";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function TopicInterestFormRenderer({ name, field }: FormRendererProps) {
    const form = useFormContext();
    const topics = (field.options.topics as { key: string, name: string }[]);
    const values = field.options.values as string[];
    const [selected, setSelected] = useState(
        topics.map(t => ({ [t.key]: values[0] })).reduce((pv, cv) => {
            return { ...pv, ...cv };
        }, {})
    );

    useEffect(() => {
        form.set(name, JSON.stringify(selected));
    }, [name, selected, form]);

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
