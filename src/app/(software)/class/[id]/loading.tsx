import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassFeedLoading() {
  return (      <PageLayout>
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Class Header Skeleton */}
      <Card className="relative overflow-hidden border-0">
        <div className="h-32 relative">
          <Skeleton className="absolute inset-0 rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Skeleton className="h-7 w-48 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </Card>

      {/* New Post Card Skeleton */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Items Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </PageLayout>)
}