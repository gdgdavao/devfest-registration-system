import { Download } from "lucide-react";
import { BarChart, Card, DonutChart, List, ListItem } from "@tremor/react";

import { SummaryShare, SummarySubentries, pb, useSummaryQuery } from "@/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { Collections } from "@/pocketbase-types";
import DataFilter from "@/components/data-filter/DataFilter";
import { useState } from "react";
import { DataFilterValue } from "@/components/data-filter/types";
import { compileFilter } from "@/lib/pb_filters";

const CHART_COLORS = [
  "bg-blue-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-blue-950",
  "bg-blue-300",
];

const REGISTRATION_FIELDS = {
  type: "Registrant Type",
  sex: "Gender",
  age_range: "Age Ranges",
  years_tech_exp: "Years of Tech Experience",
  topic_interests: "Topics of Interest",
} as const;

const TOPIC_FIELDS = {
  web: "Web",
  gcp: "GCP",
  ml: "ML",
  android_dev: "Android",
  iot: "IoT",
  firebase: "Firebase",
  flutter: "Flutter",
  assistant: "Assistant",
  vr: "VR",
  material: "Material Design",
} as const;

export default function RegistrationSummary() {
  const [filters, setFilters] = useState<DataFilterValue[]>([]);
  const { data, isLoading, isFetched } = useSummaryQuery(
    Collections.Registrations,
    {
      except: ["email", "first_name", "last_name", "contact_number"],
      filter: compileFilter(...filters.map(f => f.expr))
    }
  );

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h2>Registration Metrics</h2>
        <div className="space-x-2">
          {data?.csv_endpoint && (
            <Button asChild>
              <a href={pb.buildUrl(data.csv_endpoint)} download>
                <Download className="mr-2" />
                Export data
              </a>
            </Button>
          )}
        </div>
      </header>

      <DataFilter
        collection="registrations"
        value={filters}
        onChange={setFilters} />

      {isLoading && !isFetched && (
        <div className="flex flex-col items-center">
          <Loading className="w-48" />
        </div>
      )}

      {isFetched && !data && (
        <div className="flex flex-col items-center">
          <p className="text-3xl text-muted-foreground">No data found.</p>
        </div>
      )}

      {data?.insights.map((insight) =>
        insight.title === "topic_interests" ? (
          <Card key={`insight_${insight.id}`} className="p-8 mb-4">
            <h3 className="mb-4">
              {
                REGISTRATION_FIELDS[
                  insight.title as keyof typeof REGISTRATION_FIELDS
                ]
              }
            </h3>
            <BarChart
              className="mt-6"
              data={insight.share.map((item) => {
                const { value, entries } = item as SummarySubentries;

                const group: Record<string, string | number> = {
                  name: TOPIC_FIELDS[value as keyof typeof TOPIC_FIELDS],
                };

                entries.forEach(
                  (entry) =>
                    (group[entry.value] = (entry as SummaryShare).count)
                );

                return group;
              })}
              index="name"
              categories={[
                "Very Interested",
                "Somewhat Interested",
                "Neutral",
                "Not Very Interested",
                "Not Interested at All",
              ]}
              colors={["blue", "red", "yellow", "green", "orange"]}
              yAxisWidth={48}
            />
          </Card>
        ) : (
          <Card key={`insight_${insight.id}`} className="p-8 mb-4">
            <h3 className="mb-4">
              {
                REGISTRATION_FIELDS[
                  insight.title as keyof typeof REGISTRATION_FIELDS
                ]
              }
            </h3>

            <div className="p-4 flex items-center space-x-6">
              <DonutChart
                index="value"
                category="count"
                variant="pie"
                showTooltip={false}
                data={insight.share}
                colors={["blue", "red", "yellow", "green", "orange"]}
              />
              <List>
                {insight.share.map((data, index) => (
                  <ListItem key={data.value} className="space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className={cn(
                          CHART_COLORS[index],
                          "h-2.5 w-2.5 rounded-sm flex-shrink-0"
                        )}
                      />
                      <span className="truncate">{data.value}</span>
                    </div>
                    <span>{(data as SummaryShare).count}</span>
                  </ListItem>
                ))}
              </List>
            </div>
          </Card>
        )
      )}
    </div>
  );
}
