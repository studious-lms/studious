"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { DataTable } from "@/components/ui/DataTable";
import { HiDocument, HiAcademicCap, HiUser, HiChevronRight } from "react-icons/hi";
import FileDownload from "@/components/class/FileDownload";
import Card from "@/components/ui/Card";
import Skeleton, { SkeletonText, SkeletonTable } from "@/components/ui/Skeleton";

function Breadcrumb({ classId, assignmentTitle }: { classId: string, assignmentTitle?: string }) {
    return (
        <Card className="flex items-center text-sm text-muted-foreground mb-6 space-x-1">
            <Link href="/classes" className="hover:underline">Classes</Link>
            <HiChevronRight className="inline w-4 h-4 mx-1" />
            <Link href={`/classes/${classId}/files`} className="hover:underline">Files</Link>
            {assignmentTitle && (
                <>
                    <HiChevronRight className="inline w-4 h-4 mx-1" />
                    <span className="text-foreground font-medium">{assignmentTitle}</span>
                </>
            )}
        </Card>
    );
}

// Skeleton component for breadcrumb
const BreadcrumbSkeleton = () => (
    <Card className="flex items-center text-sm text-muted-foreground mb-6 space-x-1">
        <Skeleton width="4rem" height="1rem" />
        <Skeleton width="1rem" height="1rem" />
        <Skeleton width="4rem" height="1rem" />
        <Skeleton width="1rem" height="1rem" />
        <Skeleton width="8rem" height="1rem" />
    </Card>
);

// Skeleton component for assignment title
const AssignmentTitleSkeleton = () => (
    <Skeleton width="12rem" height="1.5rem" />
);

// Skeleton component for section header
const SectionHeaderSkeleton = () => (
    <div className="font-semibold flex items-center space-x-2 mb-2">
        <Skeleton width="1rem" height="1rem" />
        <Skeleton width="8rem" height="1rem" />
    </div>
);

// Skeleton for the entire assignment files page
const AssignmentFilesPageSkeleton = () => (
    <div className="flex flex-col space-y-6">
        <BreadcrumbSkeleton />
        <AssignmentTitleSkeleton />
        
        {/* Teacher Attachments section skeleton */}
        <div>
            <SectionHeaderSkeleton />
            <SkeletonTable rows={3} columns={3} />
        </div>
        
        {/* Student Submissions section skeleton */}
        <div>
            <SectionHeaderSkeleton />
            <SkeletonTable rows={5} columns={4} />
        </div>
    </div>
);

export default function AssignmentFilesPage() {
    const params = useParams();
    const classId = params.classId as string;
    const assignmentId = params.assignmentId as string;
    const { data: files, isLoading, error } = trpc.class.getFiles.useQuery({ classId });

    if (isLoading) return <AssignmentFilesPageSkeleton />;
    if (error) return <div className="p-8 text-red-500">Error loading files: {error.message}</div>;
    if (!files) return <div className="p-8 text-muted-foreground">No files found.</div>;

    const assignment = files.find((a: any) => a.id === assignmentId);
    if (!assignment) return <div className="p-8 text-muted-foreground">Assignment not found.</div>;

    // Teacher attachments table
    const teacherColumns = [
        {
            header: "File Name",
            accessor: "name",
            cell: (row: any) => (
                <FileDownload
                    src={row.id}
                    name={row.name}
                    type={row.type}
                    thumbnailId={row.thumbnailId}
                />
            ),
        },
        { header: "Type", accessor: "type" },
        { header: "Uploader", accessor: "uploader", cell: () => (
            <span className="flex items-center space-x-1 text-blue-600"><HiAcademicCap className="inline w-4 h-4" /> <span>Teacher</span></span>
        ) },
    ];

    // Student files table (attachments + annotations)
    const studentFiles: any[] = [];
    assignment.students.forEach((student: any) => {
        (student.attachments || []).forEach((file: any) => {
            studentFiles.push({ ...file, student: student.username, type: file.type, kind: "Attachment" });
        });
        (student.annotations || []).forEach((file: any) => {
            studentFiles.push({ ...file, student: student.username, type: file.type, kind: "Annotation" });
        });
    });
    const studentColumns = [
        {
            header: "File Name",
            accessor: "name",
            cell: (row: any) => (
                <FileDownload
                    src={row.id}
                    name={row.name}
                    type={row.type}
                    thumbnailId={row.thumbnailId}
                />
            ),
        },
        { header: "Type", accessor: "type" },
        { header: "Student", accessor: "student" },
        { header: "Kind", accessor: "kind" },
    ];

    return (
        <div className="flex flex-col space-y-6">
            <Breadcrumb classId={classId} assignmentTitle={assignment.title} />
            <span className="text-xl font-bold">{assignment.title}</span>
            <div>
                <div className="font-semibold flex items-center space-x-2 mb-2">
                    <HiAcademicCap className="w-4 h-4 text-blue-500" />
                    <span>Teacher Attachments</span>
                </div>
                <DataTable
                    columns={teacherColumns}
                    data={assignment.teacherAttachments}
                    emptyTitle="No Teacher Files"
                    emptyDescription="No teacher files for this assignment."
                />
            </div>
            <div>
                <div className="font-semibold flex items-center space-x-2 mb-2">
                    <HiUser className="w-4 h-4 text-green-500" />
                    <span>Student Submissions</span>
                </div>
                <DataTable
                    columns={studentColumns}
                    data={studentFiles}
                    emptyTitle="No Student Files"
                    emptyDescription="No student submissions for this assignment."
                />
            </div>
        </div>
    );
} 