"use client";

import { useParams, useRouter } from "next/navigation";
import { useNavigation, ROUTES } from "@/lib/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { openModal } from "@/store/appSlice";
import { HiFolder, HiChevronRight, HiPlus, HiUpload, HiTrash, HiArrowLeft } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import IconFrame from "@/components/ui/IconFrame";
import CreateFolder from "@/components/class/forms/CreateFolder";
import UploadFilesToFolder from "@/components/class/forms/UploadFilesToFolder";
import FileDisplay from "@/components/class/FileDisplay";
import FolderDisplay from "@/components/class/FolderDisplay";

function Breadcrumb({ classId, currentFolder, parentFolder }: { 
    classId: string; 
    currentFolder: any;
    parentFolder?: any;
}) {
    return (
        <Card className="flex items-center text-sm text-muted-foreground mb-6 space-x-1">
            <Link href="/classes" className="hover:underline">Classes</Link>
            <HiChevronRight className="inline w-4 h-4 mx-1" />
            <Link href={`/classes/${classId}/files`} className="hover:underline">Files</Link>
            {parentFolder && (
                <>
                    <HiChevronRight className="inline w-4 h-4 mx-1" />
                    <Link href={`/classes/${classId}/files/${parentFolder.id}`} className="hover:underline">
                        {parentFolder.name}
                    </Link>
                </>
            )}
            <HiChevronRight className="inline w-4 h-4 mx-1" />
            <span className="text-foreground font-medium">{currentFolder.name}</span>
        </Card>
    );
}

export default function FolderPage() {
    const params = useParams();
    const classId = params.classId as string;
    const folderId = params.folderId as string;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);

    const { data: folder, isLoading, error, refetch } = trpc.folder.get.useQuery({ 
        folderId ,
        classId
    });

    const deleteFolder = trpc.folder.delete.useMutation({
        onSuccess: () => {
            navigation.push(ROUTES.CLASS_FILES(classId));
        },
    });

    const handleCreateFolder = () => {
        dispatch(openModal({
            header: "Create New Folder",
            body: <CreateFolder 
                classId={classId} 
                parentFolderId={folderId}
                onSuccess={refetch}
            />
        }));
    };

    const handleUploadFiles = () => {
        dispatch(openModal({
            header: "Upload Files",
            body: <UploadFilesToFolder 
                classId={classId}
                folderId={folderId}
                folderName={folder?.name || ""}
                onSuccess={refetch}
            />
        }));
    };

    const handleDeleteFolder = () => {
        if (confirm(`Are you sure you want to delete the folder "${folder?.name}" and all its contents?`)) {
            deleteFolder.mutate({ classId, folderId });
        }
    };

    const handleFolderClick = (subfolder: any) => {
        navigation.push(ROUTES.FILES_FOLDER(classId, subfolder.id));
    };

    const handleBackToParent = () => {
        if (folder?.parentFolder) {
            navigation.push(ROUTES.FILES_FOLDER(classId, folder.parentFolder.id));
        } else {
            navigation.push(ROUTES.CLASS_FILES(classId));
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="p-8 text-red-500">
                Error loading folder: {error.message}
            </div>
        );
    }

    if (!folder) {
        return (
            <div className="p-8 text-muted-foreground">
                Folder not found.
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="font-semibold text-xl text-foreground-primary">{folder.name}</h1>
                        <p className="text-sm text-foreground-muted mt-1">
                            {folder.files.length} files, {folder.childFolders.length} subfolders
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button.Primary onClick={handleUploadFiles} className="flex items-center space-x-2">
                        <HiUpload className="w-4 h-4 mr-2" />
                        Upload Files
                    </Button.Primary>
                    <Button.Primary onClick={handleCreateFolder} className="flex items-center space-x-2">
                        <HiPlus className="w-4 h-4 mr-2" />
                        New Folder
                    </Button.Primary>
                    {appState.user.teacher && (
                        <Button.Light
                            onClick={handleDeleteFolder}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <HiTrash className="w-4 h-4" />
                        </Button.Light>
                    )}
                </div>
            </div>

            <Breadcrumb classId={classId} currentFolder={folder} parentFolder={folder.parentFolder} />

            {/* Subfolders */}
            {folder.childFolders.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-foreground-primary">Folders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {folder.childFolders.map((subfolder) => (
                            <FolderDisplay
                                key={subfolder.id}
                                folder={subfolder}
                                classId={classId}
                                currentFolderId={folderId}
                                onFolderClick={handleFolderClick}
                                onFolderUpdated={refetch}
                                showOperations={appState.user.teacher}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Files */}
            <div className="space-y-4">
                <h2 className="text-lg font-medium text-foreground-primary">Files</h2>
                {folder.files.length > 0 ? (
                    <div className="space-y-3">
                        {folder.files.map((file) => (
                            <FileDisplay
                                key={file.id}
                                file={file}
                                showDelete={appState.user.teacher}
                                classId={classId}
                                currentFolderId={folderId}
                                onFileUpdated={refetch}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty
                        icon={HiFolder}
                        title="No files"
                        description="No files have been uploaded to this folder yet."
                    />
                )}
            </div>
        </div>
    );
} 