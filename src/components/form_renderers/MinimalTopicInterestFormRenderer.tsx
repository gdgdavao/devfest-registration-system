import { FormFieldRendererProps } from "../FormFieldRenderer";
import { useEffect } from "react";
import { pb, useTopicInterestsQuery } from "@/client";
import { Card, CardContent } from "../ui/card";
import Loading from "../Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";

export default function MinimalTopicInterestFormRenderer({
    onChange,
    value = {},
    field,
    disabled,
    className
}: FormFieldRendererProps & { className?: string }) {
    const { data: topics, isLoading } = useTopicInterestsQuery();
    const values = (field.options.values as string[]).slice().reverse();
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
        <div className={cn('relative', className)}>
            {isLoading && <div className="bg-white/40 h-full w-full absolute inset-0 flex flex-col py-24">
                <Loading className="w-48 mx-auto" />
            </div>}

            <div className="flex flex-col space-y-2">
                {topics?.map((topic) => (
                    <Card key={`topic_${topic.key}`}>
                        <CardContent className="flex p-3 flex-col md:flex-row items-center">
                            <div className="text-left w-full items-start md:items-center flex md:w-1/2 space-x-3">
                                {topic.icon &&
                                    <img
                                        className="w-4 h-full"
                                        src={pb.files.getUrl(topic, topic.icon, { 'thumb': '0x30' })}
                                        alt={topic.topic_name} />}
                                <p className="text-sm">{topic.topic_name}</p>
                            </div>

                            <div className="w-full md:w-1/2 mt-2 md:mt-0">
                                <Select
                                    disabled={disabled}
                                    defaultValue={selected[topic.key]}
                                    onValueChange={(v) => setSelected(s => ({ ...s, [topic.key]: v }))}>
                                    <SelectTrigger>
                                        <SelectValue>{ selected[topic.key] }</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {values.map(v => (
                                            <SelectItem
                                                key={`value_${topic.key}_${v}`}
                                                value={v}>
                                                {v}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
