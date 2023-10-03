import LoadingGif from "@/assets/loading.gif";

export default function Loading({ className }: { className?: string }) {
    return (
        <div className={className}>
            <img src={LoadingGif} className="w-full h-auto" />
        </div>
    );
}
