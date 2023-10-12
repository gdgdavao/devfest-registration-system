import { pb } from "@/client";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

export default function MerchSensingSummary() {
    const { data, isLoading, isFetched } = useQuery(['merch_sensing', 'summary'], () => {
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
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:justify-between pb-4">
                <div className="flex items-center space-x-2 pb-8">
                    <h2>Merch Sensing Summary</h2>
                    <Badge>{data?.total ?? 0}</Badge>
                </div>

                <div className="space-x-2">
                    <Button asChild>
                        <a href={pb.buildUrl(`/merch-sensing/summary/export`)} download>
                            <Download className="mr-2" />
                            Export data
                        </a>
                    </Button>
                </div>
            </div>

            {(isLoading && !isFetched) && <div className="flex flex-col items-center">
                <Loading className="w-48" />
            </div>}

            {(isFetched && !data) && <div className="flex flex-col items-center">
                <p className="text-3xl text-muted-foreground">No data found.</p>
            </div>}

            {data?.insights.map(insight => (
                <section key={`insight_${insight.id}`} className="pb-8">
                    <div className="flex items-center space-x-2">
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
