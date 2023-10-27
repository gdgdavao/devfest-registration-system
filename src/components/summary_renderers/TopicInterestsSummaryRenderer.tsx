import { BarChart, List, ListItem } from "@tremor/react";
import { SummaryRendererProps } from "../SummaryRenderer";
import { pb, useTopicInterestsQuery } from "@/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useMemo, useState } from "react";
import Loading from "../Loading";

const VALUES = [
    "Very Interested",
    "Somewhat Interested",
    "Neutral",
    "Not Very Interested",
    "Not Interested at All",
];

export default function TopicInterestsSummaryRenderer({ insight }: SummaryRendererProps) {
    const [value, setValue] = useState(VALUES[0]);
    const { data: topics, isLoading } = useTopicInterestsQuery();

    const results = useMemo(() => {
        if (!topics) {
            return [];
        }

        const entries: { id: string, icon: string, label: string, count: number }[] = [];
        for (const share of insight.share) {
            if (!('entries' in share)) {
                continue;
            }

            const foundEntry = share.entries.find(e => e.value === value);
            if (!foundEntry || !('count' in foundEntry)) {
                continue;
            }

            const topic = topics.find(t => t.key === share.value);

            entries.push({
                id: topic?.key ?? share.value,
                icon: topic ? pb.files.getUrl(topic, topic.icon, { 'thumb': '0x30' }) : '',
                label: topic?.topic_name ?? 'Unknown',
                count: foundEntry.count
            });
        }

        return entries.sort((a, b) =>
            a.count === b.count ? 0 : a.count > b.count ? -1 : 1)
    }, [topics, insight, value]);

    return (
        <div className="flex flex-col space-y-2">
            <BarChart
                className="mt-6"
                data={results}
                index="id"
                categories={["count"]}
                colors={["blue", "red", "yellow", "green", "orange"]}
                yAxisWidth={48}
            />

            {isLoading ? (
                <div className="h-full w-full flex flex-col py-24">
                    <Loading className="w-48 mx-auto" />
                </div>
            ) : (
                <Tabs value={value} onValueChange={setValue}>
                    <TabsList>
                        {VALUES.map((v) => (
                            <TabsTrigger key={`value_trigger_${v}`} value={v}>{v}</TabsTrigger>
                        ))}
                    </TabsList>

                    {VALUES.map((v) => (
                        <TabsContent key={`value_${v}`} value={v}>
                            <List>
                                {results.map((topic) => (
                                    <ListItem key={topic.label} className="flex space-x-2">
                                        <div className="w-full flex items-center md:w-1/2 space-x-3">
                                            {topic.icon &&
                                                <img src={topic.icon} alt={topic.label} className="w-8" />}
                                            <span>{topic.label}</span>
                                        </div>

                                        <span>{topic.count}</span>
                                    </ListItem>
                                ))}
                            </List>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    );
}
