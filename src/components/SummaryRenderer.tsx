import { CollectionInsight } from "@/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FC } from "react";
import PieChartSummaryRenderer from "./summary_renderers/PieChartSummaryRenderer";
import BarGraphSummaryRenderer from "./summary_renderers/BarGraphSummaryRenderer";

export interface SummaryRendererProps {
  insight: CollectionInsight
}

export default function SummaryRenderer({ className, title, insight, customComponents }: {
  className?: string,
  title?: string
  insight: CollectionInsight
  customComponents: Record<string, FC<SummaryRendererProps>>
}) {
  const Component = insight.id in customComponents
    ? customComponents[insight.id]
    : insight.share.length > 5
    ? BarGraphSummaryRenderer :
      PieChartSummaryRenderer;

  return (
    <Card className={className} key={`insight_${insight.id}`}>
      <CardHeader>
        <CardTitle>
          {title ?? insight.title}
        </CardTitle>
        <CardDescription>{insight.total} responses</CardDescription>
      </CardHeader>
      <CardContent>
        <Component insight={insight} />
      </CardContent>
    </Card>
  );
}
