import { SummaryShare } from "@/client";
import { cn } from "@/lib/utils";
import { DonutChart, List, ListItem } from "@tremor/react";
import { SummaryRendererProps } from "../SummaryRenderer";

const CHART_COLORS = [
  "bg-blue-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-blue-950",
  "bg-blue-300",
];

export default function PieChartSummaryRenderer({ insight }: SummaryRendererProps) {
  return (
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
  );
}
