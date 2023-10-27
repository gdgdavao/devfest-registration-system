import { Download } from "lucide-react";

import { pb, useSummaryQuery } from "@/client";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { Collections } from "@/pocketbase-types";
import DataFilter from "@/components/data-filter/DataFilter";
import { stringify } from "@nedpals/pbf";
import useAdminFiltersState from "@/lib/admin_utils";
import SummaryRenderer from "@/components/SummaryRenderer";
import TopicInterestsSummaryRenderer from "@/components/summary_renderers/TopicInterestsSummaryRenderer";

const REGISTRATION_FIELDS = {
  type: "Registrant Type",
  sex: "Gender",
  age_range: "Age Ranges",
  years_tech_exp: "Years of Tech Experience",
  topic_interests: "Topics of Interest",
} as const;

export default function RegistrationSummary() {
  const { finalFilter, filters, setFilters } = useAdminFiltersState();
  const { data, isLoading, isFetched } = useSummaryQuery(
    Collections.Registrations,
    {
      except: ["email", "first_name", "last_name", "contact_number"],
      filter: stringify(finalFilter)
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

      <div className="mb-8">
        <DataFilter
          collection="registrations"
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
          title={REGISTRATION_FIELDS[insight.title as keyof typeof REGISTRATION_FIELDS]}
          insight={insight}
          customComponents={{
            'topic_interests': TopicInterestsSummaryRenderer
          }} />
      )}
      </div>
    </div>
  );
}
