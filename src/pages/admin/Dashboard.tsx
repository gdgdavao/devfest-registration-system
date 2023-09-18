import { pb } from "@/client"
import { useQuery } from "@tanstack/react-query"

export default function AdminDashboard() {
    const { data } = useQuery(['registrations'], () => {
        return pb.collection('registrations').getList();
    })

    return (
        <div className="max-w-xl mx-auto pt-12">
            <h2 className="text-4xl font-bold">{data?.totalItems} registrations</h2>


        </div>
    )
}
