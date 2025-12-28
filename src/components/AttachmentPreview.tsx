import { FileItem } from "@/lib/types/file";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreviewModal } from "./modals";
import { useState } from "react";
import { getFilePreviewHandlers } from "@/lib/file/file";

export default function AttachmentPreview({ fileItem, onRemove }: { fileItem: FileItem | File, onRemove: () => void }) {
    const [previewOpen, setPreviewOpen] = useState(false);

    if (fileItem instanceof File)
        return (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate items-center">
                <span>{fileItem.name}</span>
                <span className="text-xs text-muted-foreground"> (preview)</span>
            </span>
                <span className="text-xs text-muted-foreground">
                    {(fileItem.size / 1024).toFixed(2)} KB
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={onRemove}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        )
    return (<><div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm hover:bg-muted cursor-pointer" onClick={() => setPreviewOpen(true)}>
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate">{(fileItem as FileItem).name}</span>
        <span className="text-xs text-muted-foreground">
            {(fileItem as FileItem).size || "—"}
        </span>
        <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onRemove}
        >
            <X className="h-3 w-3" />
        </Button>
    </div>
        <FilePreviewModal
            file={fileItem}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            onAction={getFilePreviewHandlers}
        />
    </>)
}