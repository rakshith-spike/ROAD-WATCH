import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { router } from "./router";

function AppLoader() {
  return (
    <div className="app-background p-8">
      <div className="mx-auto max-w-4xl space-y-3">
        <LoadingSkeleton className="h-10 w-72" />
        <LoadingSkeleton className="h-64 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<AppLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
