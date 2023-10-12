import { pb } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

export default function MerchSensingSummary() {
    const { data } = useQuery(['merch_sensing', 'summary'], () => {
        return pb.send<{
            total: number
            insights: {
                id: string
                title: string
                total: number
                share: Record<string, number>
            }[]
        }>('/api/merch-sensing/summary', {});
    });

    return (
        <div className="max-w-5xl mx-auto pt-12 flex flex-col pb-48">
            <div className="flex items-center space-x-2 pb-8">
                <h2>Merch Sensing Summary</h2>
                <Badge>{data?.total ?? 0}</Badge>
            </div>

            {data?.insights.map(insight => (
                <section key={`insight_${insight.id}`} className="pb-8">
                    <div className="flex items-center space-x-2 pb-4">
                        <h3>{insight.title}</h3>
                        <Badge>{insight.total}</Badge>
                    </div>

                    <Table className="border">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entry name</TableHead>
                                <TableHead>Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(insight.share)
                                .sort((a, b) => a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1)
                                .map(([entry, count]) => (
                                    <TableRow key={`insight_entry_${entry}`}>
                                        <TableCell>{entry}</TableCell>
                                        <TableCell>{count}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </section>
            ))}
        </div>
    );
}
