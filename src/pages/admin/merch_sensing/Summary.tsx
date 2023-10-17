import { pb, useSummaryQuery } from "@/client";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collections } from "@/pocketbase-types";
import { Download } from "lucide-react";

export default function MerchSensingSummary() {
    const { data, isLoading, isFetched } = useSummaryQuery(Collections.MerchSensingData, {
        splittable: ['other_preferred_offered_merch'],
        except: ['registrant']
    });

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:justify-between pb-4">
                <div className="flex items-center space-x-2 pb-4">
                    <h2>Merch Sensing Summary</h2>
                    <Badge>{data?.total ?? 0}</Badge>
                </div>

                <div className="space-x-2">
                    {data?.csv_endpoint && <Button asChild>
                        <a href={pb.buildUrl(data.csv_endpoint)} download>
                            <Download className="mr-2" />
                            Export data
                        </a>
                    </Button>}
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
                    <div className="flex items-center space-x-2 mb-4">
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
                            {insight.share.map(({ value: entry, ...others }) => {
                                if ('entries' in others) {
                                    return <>
                                        {/* TODO: improve this next time */}
                                        {others.entries.filter(e => 'count' in e).map(({ value: subentry, ...others }) => (
                                            <TableRow key={`insight_entry_${entry}_${entry}`}>
                                                <TableCell>{entry} &gt; {subentry}</TableCell>
                                                {'count' in others && <TableCell>{others.count}</TableCell>}
                                            </TableRow>
                                        ))}
                                    </>;
                                }

                                return <TableRow key={`insight_entry_${entry}`}>
                                    <TableCell>{entry}</TableCell>
                                    <TableCell>{others.count}</TableCell>
                                </TableRow>;
                            })}
                        </TableBody>
                    </Table>
                </section>
            ))}
        </div>
    );
}
