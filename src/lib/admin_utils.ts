import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import JSONCrush from "jsoncrush";
import { DataFilterValue } from "@/components/data-filter/types";
import * as pbf from "@nedpals/pbf";

export default function useAdminFiltersState(filtersForSearch?: (f: string) => pbf.Filter) {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo<DataFilterValue[]>(() => {
        if (searchParams.has('filter')) {
            const parsed = JSON.parse(JSONCrush.uncrush(searchParams.get('filter')!));
            return Array.isArray(parsed) ? parsed : [parsed];
        }
        return [];
    }, [searchParams]);
    const setFilters = (filters: DataFilterValue[]) => setSearchParams(sp => {
        if (filters.length === 0) {
            sp.delete('filter');
        } else {
            sp.set('filter', JSONCrush.crush(JSON.stringify(filters)));
        }
        return sp;
    });

    const searchFilter = useMemo(() => searchParams.get('search') ?? '', [searchParams])
    const setSearchFilter = (v: string) => setSearchParams(sf => {
        if (v.length === 0) {
            sf.delete('search');
        } else {
            sf.set('search', v);
        }
        return sf;
    });

    const finalFilter = useMemo<pbf.MaybeFilter<pbf.Filter>>(() => {
        if (searchFilter.length === 0 && filters.length === 0) {
            return null;
        } else if (searchFilter.length === 0) {
            if (filters.length === 1) {
                return filters[0];
            }
            return pbf.and(...filters)
        }

        const _filtersForSearch = filtersForSearch?.(searchFilter) ?? null;
        if (filters.length === 0) {
            return _filtersForSearch;
        }

        return pbf.and.maybe(_filtersForSearch, ...filters);
    }, [filters, searchFilter]);

    return {
        searchFilter,
        setSearchFilter,
        filters,
        setFilters,
        finalFilter
    }
}
