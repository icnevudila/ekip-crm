export default function LoadingSkeleton({ lines = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export function CardSkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="skeleton h-28 rounded-2xl" />
      ))}
    </div>
  );
}
