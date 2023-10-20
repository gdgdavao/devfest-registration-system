import { pb } from "@/client";
import { useQuery } from "@tanstack/react-query";
import SelectDataFilterValue from "./SelectDataFilterValue";

export default function RemoteSelectDataFilterValue({ collectionId, value, onChange }: {
    value: string
    collectionId: string
    onChange: (s: string) => void
}) {
    const { data } = useQuery(['fields', 'remote_select_data', collectionId], () => {
        return pb.collection(collectionId).getFullList();
    }, {
        select(data) {
            return data.map(r => r.id)
        },
    });

    return <SelectDataFilterValue
        value={value}
        onChange={onChange}
        values={data ?? []} />;
}
