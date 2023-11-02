import { SummarySubentries } from "@/client";
import SummaryRenderer, { SummaryRendererProps } from "../SummaryRenderer";
export default function PreferencesSummaryRenderer({ insight }: SummaryRendererProps) {
    const insights = insight.share as SummarySubentries[];
    
    return (<>
    {insights.map((insight) =>
        <SummaryRenderer
            key={`insight_${insight.value}`}
            insight={{
                id: insight.value,
                share: insight.entries,
                title: insight.value,
                total: insight.entries.reduce((pv, cv) => 'count' in cv ? pv + cv.count : pv, 0),
                type: 'text'
            }}
            customComponents={{}} />
    )}
    </>);
}
