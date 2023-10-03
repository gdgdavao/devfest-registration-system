import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useEffect } from "react";
import LikertSlider from "@/components/form_renderers/LikertSlider";
import { pb, useTopicInterestsQuery } from "@/client";
import { Card, CardContent } from "../ui/card";

export default function TopicInterestFormRenderer({
    onChange,
    value = {},
    field,
}: FormFieldRendererProps) {
    const { data: topics } = useTopicInterestsQuery();
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
                (topics ?? [])
                    .map((t) => ({ [t.key]: values[0] }))
                    .reduce((pv, cv) => {
                        return { ...pv, ...cv };
                    }, {})
            );
        }
    }, [value, onChange, selected, topics, values]);

    return (
        <div>
            <div className="flex flex-col space-y-3">
                {topics?.map((topic) => (
                    <Card key={`topic_${topic.key}`}>
                        <CardContent className="flex pt-6 flex-col md:flex-row items-center">
                            <div className="w-full md:w-1/2 space-y-2 mb-8 md:mb-0">
                                {topic.icon &&
                                    <img
                                        src={pb.files.getUrl(topic, topic.icon, { 'thumb': '0x30' })}
                                        alt={topic.topic_name} />}
                                <p>{topic.topic_name}</p>
                            </div>

                            <div className="w-full md:w-1/2 flex flex-col">
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

                                <p className="mt-4 text-left md:text-center">{selected[topic.key]}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
