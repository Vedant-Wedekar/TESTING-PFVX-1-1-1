export default function SkeletonCard() {
  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="skeleton animate-shimmer h-3 w-24 mb-3" />
      <div className="skeleton animate-shimmer h-4 w-full mb-2" />
      <div className="skeleton animate-shimmer h-4 w-3/4" />
    </div>
  )
}
