import { pb, useSummaryQuery } from "@/client";
import Loading from "@/components/Loading";
import SummaryRenderer from "@/components/SummaryRenderer";
import DataFilter from "@/components/data-filter/DataFilter";
import PreferencesSummaryRenderer from "@/components/summary_renderers/PreferencesSummaryRenderer";
import { Button } from "@/components/ui/button";
import useAdminFiltersState from "@/lib/admin_utils";
import { cn } from "@/lib/utils";
import { Collections } from "@/pocketbase-types";
import { stringify } from "@nedpals/pbf";
import { Download, RefreshCcw } from "lucide-react";

export default function AddonOrdersSummary() {
  const { finalFilter, filters, setFilters } = useAdminFiltersState();
  const { data, isLoading, isRefetching, isFetched, refetch } = useSummaryQuery(
    Collections.AddonOrders,
    {
      except: ['addon.description', 'addon.customization_options', 'addon.price', 'addon.cover_image'],
      expand: ['addon'],
      filter: stringify(finalFilter)
    }
  );

  return (
    <div>
      <header className="flex flex-col md:flex-row justify-end md:justify-between md:items-center mb-6">
        <h2>Add-on Orders Metrics</h2>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button disabled={isLoading || isRefetching} onClick={() => { refetch(); }}>
            <RefreshCcw className={cn({ 'animate-spin': isRefetching }, 'mr-2')} />
            Refresh
          </Button>

          <Button disabled={!data?.csv_endpoint} asChild>
            <a href={data ? pb.buildUrl(data.csv_endpoint) : '#'} download>
              <Download className="mr-2" />
              Export data
            </a>
          </Button>
        </div>
      </header>

      <div className="mb-8">
        <DataFilter
          collection="addon_orders"
          value={filters}
          onChange={setFilters} />
      </div>

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

      <div className="space-y-4">
      {data?.insights.map((insight) =>
        <SummaryRenderer
          key={`insight_${insight.id}`}
        //   title={REGISTRATION_FIELDS[insight.title as keyof typeof REGISTRATION_FIELDS]}
          insight={insight}
          customComponents={{
            preferences: PreferencesSummaryRenderer
          }} />
      )}
      </div>
    </div>
  );
}
