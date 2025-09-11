"use client";

import { PageLayout } from "@/components/ui/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllClassesQuery } from "@/lib/api";
import { useAuthCheckQuery } from "@/lib/api/auth";
import { setTeacher } from "@/store/appSlice";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";

export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();

  const dispatch = useDispatch();
  const { data: userData, isLoading: isUserLoading, error: isUserError} = useAuthCheckQuery();
  
  // add computed flags
  const {data: classData, isLoading: isClassLoading, error: isClassError} = useGetAllClassesQuery();

  if (classData) {
    const teacherInClass = classData.teacherInClass;

    if (teacherInClass.find(cls => cls.id === id)) {
      dispatch(setTeacher(true));
    }
    if (classData.studentInClass.find(cls => cls.id === id)) {
      dispatch(setTeacher(false));
    }
  }
  
  const loading = isUserLoading || isClassLoading;
  return (
    <PageLayout>
      {loading && <div className="flex h-[calc(100vh)]">
        <main className="flex-1 overflow-auto">
          <Skeleton className="w-full h-full" />
        </main>
      </div>}
      {!loading && <div className="flex h-[calc(100vh-4rem)]">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>}
    </PageLayout>
  );
}
