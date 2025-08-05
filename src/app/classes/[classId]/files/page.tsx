"use client";

import { useParams, useRouter } from "next/navigation";
import { useNavigation, ROUTES } from "@/lib/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { openModal } from "@/store/appSlice";
import { HiFolder, HiChevronRight, HiPlus, HiUpload, HiTrash, HiAcademicCap } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import IconFrame from "@/components/ui/IconFrame";
import { DataTable } from "@/components/ui/DataTable";
import CreateFolder from "@/components/class/forms/CreateFolder";
import UploadFilesToFolder from "@/components/class/forms/UploadFilesToFolder";
import FileDisplay from "@/components/class/FileDisplay";
import FolderDisplay from "@/components/class/FolderDisplay";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

function Breadcrumb({ classId }: { classId: string }) {
    return (
        <Card className="flex items-center text-sm text-muted-foreground mb-6 space-x-1">
            <Link href="/classes" className="hover:underline">Classes</Link>
            <HiChevronRight className="inline w-4 h-4 mx-1" />
            <span className="text-foreground font-medium">Files</span>
        </Card>
    );
}

// Skeleton component for breadcrumb
const BreadcrumbSkeleton = () => (
    <Card className="flex items-center text-sm text-muted-foreground mb-6 space-x-1">
        <Skeleton width="4rem" height="1rem" />
        <Skeleton width="1rem" height="1rem" />
        <Skeleton width="4rem" height="1rem" />
    </Card>
);

// Skeleton component for file/folder item
const FileFolderSkeleton = () => (
    <div className="flex items-center justify-between p-4 border-b border-border hover:bg-background-muted transition-colors">
        <div className="flex items-center space-x-3">
            <Skeleton width="2.5rem" height="2.5rem" className="rounded" />
            <div className="flex flex-col space-y-1">
                <Skeleton width="8rem" height="1rem" />
                <Skeleton width="6rem" height="0.75rem" />
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Skeleton width="4rem" height="1rem" />
            <Skeleton width="2rem" height="2rem" />
            <Skeleton width="2rem" height="2rem" />
        </div>
    </div>
);

// Skeleton component for file browser
const FileBrowserSkeleton = () => (
    <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
                <Skeleton width="1.5rem" height="1.5rem" />
                <Skeleton width="8rem" height="1.25rem" />
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton width="6rem" height="2.5rem" />
                <Skeleton width="6rem" height="2.5rem" />
            </div>
        </div>
        <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
                <FileFolderSkeleton key={index} />
            ))}
        </div>
    </Card>
);

// Skeleton component for folder structure
const FolderStructureSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment files skeleton */}
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Skeleton width="1.5rem" height="1.5rem" />
                <Skeleton width="10rem" height="1.25rem" />
            </div>
            <FileBrowserSkeleton />
        </div>

        {/* Custom files skeleton */}
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Skeleton width="1.5rem" height="1.5rem" />
                <Skeleton width="8rem" height="1.25rem" />
            </div>
            <FileBrowserSkeleton />
        </div>
    </div>
);

// Skeleton for the entire files page
const FilesPageSkeleton = () => (
    <div className="flex flex-col space-y-6 p-6">
        <BreadcrumbSkeleton />
        <FolderStructureSkeleton />
    </div>
);

export default function ClassFilesPage() {
    const params = useParams();
    const classId = params.classId as string;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);

    // Get assignment folders (readonly)
    const { data: assignmentFiles, isLoading: assignmentLoading, error: assignmentError } = trpc.class.getFiles.useQuery({ classId });
    
    // Get root folder with its files and subfolders
    const { data: rootFolder, isLoading: customLoading, error: customError, refetch } = trpc.folder.getRootFolder.useQuery({ classId });

    const deleteFolder = trpc.folder.delete.useMutation({
        onSuccess: () => {
            refetch();
        },
    });

    const handleCreateFolder = () => {
        dispatch(openModal({
            header: "Create New Folder",
            body: <CreateFolder 
                classId={classId} 
                onSuccess={refetch}
            />
        }));
    };

    const handleUploadToRoot = () => {
        if (rootFolder) {
            dispatch(openModal({
                header: "Upload Files to Class Files",
                body: <UploadFilesToFolder 
                    classId={classId}
                    folderId={rootFolder.id}
                    folderName="Class Files"
                    onSuccess={refetch}
                />
            }));
        }
    };

    const handleUploadToSubfolder = (folderId: string, folderName: string) => {
        dispatch(openModal({
            header: "Upload Files",
            body: <UploadFilesToFolder 
                classId={classId}
                folderId={folderId}
                folderName={folderName}
                onSuccess={refetch}
            />
        }));
    };

    const handleDeleteFolder = (folderId: string, folderName: string) => {
        if (confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents?`)) {
            deleteFolder.mutate({ classId, folderId });
        }
    };

    const handleFolderClick = (folder: any) => {
        navigation.push(ROUTES.FILES_FOLDER(classId, folder.id));
    };

    // Show skeleton loading if any data is loading
    if (assignmentLoading || customLoading) {
        return <FilesPageSkeleton />;
    }

    if (assignmentError || customError) {
        return (
            <div className="p-8 text-red-500">
                Error loading files: {assignmentError?.message || customError?.message}
            </div>
        );
    }

    // Assignment folders table columns
    const assignmentColumns = [
        {
            header: "Assignment",
            accessor: "title",
            cell: (row: any) => (
                <div className="flex items-center space-x-2">
                    <IconFrame className="p-2 size-8 bg-gray-100 text-gray-500 rounded-lg">
                        <HiAcademicCap className="h-6 w-6" />
                    </IconFrame>
                    <span className="font-medium">{row.title}</span>
                </div>
            ),
        },
        {
            header: "Teacher",
            accessor: "teacher",
            cell: (row: any) => row.teacher?.username || "-",
        },
        {
            header: "# Files",
            accessor: "fileCount",
            cell: (row: any) => {
                const teacherFiles = row.teacherAttachments?.length || 0;
                const studentFiles = row.students?.reduce((acc: number, s: any) => acc + (s.attachments?.length || 0) + (s.annotations?.length || 0), 0) || 0;
                return teacherFiles + studentFiles;
            },
        },
    ];

    // Add computed properties for DataTable
    const customFolderTableData = rootFolder?.childFolders?.map((folder: any) => ({
        ...folder,
        fileCount: folder.files.length,
        subfolderCount: folder.childFolders.length,
    })) || [];

    const assignmentTableData = assignmentFiles?.map((f: any) => ({
        ...f,
        fileCount: (f.teacherAttachments?.length || 0) + (f.students?.reduce((acc: number, s: any) => acc + (s.attachments?.length || 0) + (s.annotations?.length || 0), 0) || 0),
    })) || [];

    return (
        <div className="flex flex-col space-y-8">
            {/* Root Folder Files Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-semibold text-xl text-foreground-primary">Class Files</h1>
                        <p className="text-sm text-foreground-muted mt-1">
                            Files and folders in the main class directory
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button.Primary onClick={handleUploadToRoot} className="flex items-center space-x-2">
                            <HiUpload className="w-4 h-4 mr-2" />
                            Upload Files
                        </Button.Primary>
                        <Button.Primary onClick={handleCreateFolder} className="flex items-center space-x-2">
                            <HiPlus className="w-4 h-4 mr-2" />
                            New Folder
                        </Button.Primary>
                    </div>
                </div>

                <Breadcrumb classId={classId} />

                {/* Root Folder Files */}
                {rootFolder && rootFolder.files && rootFolder.files.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-foreground-primary">Files</h2>
                        <div className="space-y-3">
                            {rootFolder.files.map((file: any) => (
                                <FileDisplay
                                    key={file.id}
                                    file={file}
                                    showDelete={appState.user.teacher}
                                    classId={classId}
                                    currentFolderId={rootFolder.id}
                                    onFileUpdated={refetch}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Subfolders */}
                {rootFolder && rootFolder.childFolders.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-foreground-primary">Folders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rootFolder.childFolders.map((subfolder) => (
                                <FolderDisplay
                                    key={subfolder.id}
                                    folder={subfolder}
                                    classId={classId}
                                    currentFolderId={rootFolder.id}
                                    onFolderClick={handleFolderClick}
                                    onFolderUpdated={refetch}
                                    showOperations={appState.user.teacher}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Assignment Folders Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="font-semibold text-lg text-foreground-primary">Assignment Files</h2>
                    <p className="text-sm text-foreground-muted mt-1">
                        Files organized by assignments (read-only)
                    </p>
                </div>

                {assignmentTableData.length > 0 ? (
                    <DataTable
                        columns={assignmentColumns}
                        data={assignmentTableData}
                        rowOnClick={(row) => navigation.push(ROUTES.FILES_ASSIGNMENT(classId, row.id))}
                        emptyTitle="No Assignment Folders"
                        emptyDescription="No assignment folders found."
                    />
                ) : (
                    <Empty 
                        icon={HiAcademicCap}
                        title="No assignment files"
                        description="Assignment files will appear here when assignments are created."
                    />
                )}
            </div>
        </div>
    );
} 