import { BarChart } from "@tremor/react";
import { SummaryRendererProps } from "../SummaryRenderer";

export default function BarGraphSummaryRenderer({ insight }: SummaryRendererProps) {
  return (
    <BarChart
      data={insight.share}
      index="value"
      categories={["count"]}
      colors={["blue", "red", "yellow", "green", "orange"]}
      yAxisWidth={48}
    />
  );
}
