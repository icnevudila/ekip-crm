import { Suspense } from "react";
import TasksView from "@/components/views/TasksView";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TasksView />
    </Suspense>
  );
}
