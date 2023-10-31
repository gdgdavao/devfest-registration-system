import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import JSONCrush from "jsoncrush";
import { DataFilterValue } from "@/components/data-filter/types";
import * as pbf from "@nedpals/pbf";

export default function useAdminFiltersState(filtersForSearch?: (f: string) => pbf.Filter[]) {
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

    const finalFiltersForSearch = useMemo(() => {
        return filtersForSearch?.(searchFilter) ?? [];
    }, [searchFilter]);

    const finalFilterList = useMemo<pbf.Filter[]>(() => {
        return [...finalFiltersForSearch, ...filters];
    }, [filters, finalFiltersForSearch]);

    const finalFilter = useMemo(() => {
        if (finalFilterList.length === 0) {
            return null;
        } else if (finalFilterList.length === 1) {
            return finalFilterList[0];
        } else if (filters.length === 0) {
            return pbf.or(...finalFiltersForSearch);
        } else if (finalFiltersForSearch.length === 0) {
            return pbf.and.maybe(...filters);
        }
        return pbf.and.maybe(pbf.or(...finalFiltersForSearch), ...filters);
    }, [finalFiltersForSearch, finalFilterList, filters]);

    return {
        searchFilter,
        setSearchFilter,
        filters,
        setFilters,
        finalFilter,
        finalFilterList
    }
}
