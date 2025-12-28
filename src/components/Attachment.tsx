import { FileItem } from "@/lib/types/file";
import { useState } from "react";
import { FilePreviewModal } from "./modals";
import { getFileIcon, getFilePreviewHandlers } from "@/lib/file/file";

export default function Attachment({ fileItem }: { fileItem: FileItem }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    return (<>
        <button
            key={fileItem.id}
            onClick={() => {
                setPreviewOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors text-sm"
        >
            {getFileIcon(fileItem.fileType || 'file')}
            <span className="max-w-[150px] truncate">{fileItem.name}</span>
        </button>
        <FilePreviewModal
            file={fileItem}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            onAction={getFilePreviewHandlers}
        />
    </>)
}