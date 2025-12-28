import { RouterOutputs } from "@studious-lms/server";
import { Archive, FileSpreadsheet, FileText, FileVideo, Music, Presentation, Image, File } from "lucide-react";
import { ApiFile, ApiFolder, FileItem } from "../types/file";
import { trpc } from "../trpc";
import { getCookie } from "cookies-next";

export const getFileIcon = (fileType: string, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "sm" ? "h-4 w-4" : "h-8 w-8";

    switch (fileType) {
        case "pdf":
            return <FileText className={`${iconSize} text-red-500`} />;
        case "docx":
            return <FileText className={`${iconSize} text-blue-500`} />;
        case "pptx":
            return <Presentation className={`${iconSize} text-orange-500`} />;
        case "xlsx":
            return <FileSpreadsheet className={`${iconSize} text-green-500`} />;
        case "mp4":
            return <FileVideo className={`${iconSize} text-purple-500`} />;
        case "mp3":
            return <Music className={`${iconSize} text-pink-500`} />;
        case "zip":
            return <Archive className={`${iconSize} text-gray-500`} />;
        case "jpg":
        case "png":
        case "gif":
            return <Image className={`${iconSize} text-emerald-500`} />;
        default:
            return <File className={`${iconSize} text-slate-500`} />;
    }
};

export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";

    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return "—";
    }
};

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const convertAttachmentsToFileItems = (attachments: RouterOutputs['assignment']['getSubmission']['attachments']) => {
    return attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        type: "file" as const,
        fileType: attachment.type.split('/')[1] || attachment.type,
        size: formatFileSize(attachment.size || 0),
        uploadedAt: attachment.uploadedAt || undefined,
    }));
};


export const transformFileToFileItem = (file: ApiFile, isTeacher: boolean): FileItem => ({
    id: file.id,
    name: file.name,
    type: "file" as const,
    fileType: file.type.split('/')[1] || file.name.split('.').pop(),
    size: formatFileSize(file.size || 0),
    uploadedBy: "Unknown", // API doesn't provide this in folder context
    uploadedAt: new Date().toISOString(), // API doesn't provide this
    readonly: !isTeacher, // Students can't edit files
});

export const transformFolderToFileItem = (folder: ApiFolder, isTeacher): FileItem => ({
    id: folder.id,
    name: folder.name,
    type: "folder" as const,
    itemCount: (folder.childFolders?.length || 0) + (folder.files?.length || 0),
    color: folder?.color || "#3b82f6",
    lastModified: new Date().toISOString(), // API doesn't provide this, using current date
    readonly: !isTeacher, // Students can't edit folders
});

export const getFilePreviewHandlers = (action: string, item: FileItem) => {
    const handlers = {
        onDownload: async (item: FileItem) => {
            if (item.type === "folder") {
                throw new Error("Cannot download folders directly");
            }

            try {
                // Fetch the file blob
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.split('/trpc')[0]}/api/files/${item.id}`, {
                    headers: {
                        'x-user': getCookie('token')?.toString() || '',
                    },
                });
                if (!response.ok) throw new Error("Download failed");

                const blob = await response.blob();

                // Create a temporary URL and trigger download
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = item.name;
                document.body.appendChild(link);
                link.click();

                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Download failed:", error);
                throw error;
            }
        },

        onShare: async (item: FileItem) => {
            try {
                // Generate shareable link
                const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL?.split('/trpc')[0]}/api/files/${item.id}`;

                // Try to use native share API if available
                if (navigator.share) {
                    await navigator.share({
                        title: item.name,
                        text: `Check out this ${item.type}: ${item.name}`,
                        url: shareUrl,
                    });
                } else {
                    // Fallback: Copy to clipboard
                    await navigator.clipboard.writeText(shareUrl);
                    // You could show a toast notification here
                    console.log("Share link copied to clipboard:", shareUrl);
                }
            } catch (error) {
                console.error("Share failed:", error);
                throw error;
            }
        },
    };

    switch (action) {
        case "download":
            return handlers.onDownload(item);
        case "share":
            return handlers.onShare(item);
        default:
            throw new Error(`Unknown action: ${action}`);
    }
};