import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Move,
  Folder,
  Home,
  Check,
  Loader2,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

interface SimpleFolder {
  id: string;
  name: string;
  color?: string;
}

interface MoveItemDropdownProps {
  itemId: string;
  itemName: string;
  itemType: "file" | "folder";
  classId: string;
  currentFolderId?: string;
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function MoveItemDropdown({
  itemId,
  itemName,
  itemType,
  classId,
  currentFolderId,
  onSuccess,
  onOpenChange,
}: MoveItemDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [currentFolderId_nav, setCurrentFolderId_nav] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<SimpleFolder[]>([]);

  // Fetch current folder's children
  const rootFolderQuery = trpc.folder.getRootFolder.useQuery(
    { classId }, 
    { enabled: isOpen && !currentFolderId_nav }
  );
  
  const specificFolderQuery = trpc.folder.get.useQuery(
    { classId, folderId: currentFolderId_nav! }, 
    { enabled: isOpen && !!currentFolderId_nav }
  );

  // Fetch the full parent hierarchy for the current folder
  const parentHierarchyQuery = trpc.folder.getParents.useQuery(
    { folderId: currentFolderId! },
    { enabled: isOpen && !!currentFolderId }
  );

  const currentFolderData = currentFolderId_nav ? specificFolderQuery.data : rootFolderQuery.data;
  const isLoading = currentFolderId_nav ? specificFolderQuery.isLoading : rootFolderQuery.isLoading;
  
  // Build breadcrumbs when parent hierarchy loads
  useEffect(() => {
    if (isOpen && currentFolderId_nav && parentHierarchyQuery.data && breadcrumbs.length === 0) {
      // The getParents query returns folders from current to root, so reverse it
      const parents = [...parentHierarchyQuery.data].reverse();
      
      // Build breadcrumbs from root to current (excluding root since that's handled separately)
      const breadcrumbPath = parents
        .filter(folder => folder.parentFolderId !== null) // Exclude root folder
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          color: folder.color || undefined
        }));
      
      setBreadcrumbs(breadcrumbPath);
    }
  }, [isOpen, currentFolderId_nav, parentHierarchyQuery.data, breadcrumbs.length]);

  // Get the current folder name for display
  const getCurrentFolderName = () => {
    if (!currentFolderId_nav) return "Files";
    
    // If we've navigated within the dialog, use the breadcrumb
    if (breadcrumbs.length > 0) {
      const currentInBreadcrumbs = breadcrumbs.find(b => b.id === currentFolderId_nav);
      if (currentInBreadcrumbs) return currentInBreadcrumbs.name;
    }
    
    // If we're at the initial folder and have parent hierarchy data, use that
    if (currentFolderId === currentFolderId_nav && parentHierarchyQuery.data) {
      const currentFolder = parentHierarchyQuery.data.find(f => f.id === currentFolderId);
      if (currentFolder) return currentFolder.name;
    }
    
    // If we're viewing a specific folder and have its data, use that
    if (currentFolderId_nav && specificFolderQuery.data) {
      return specificFolderQuery.data.name;
    }
    
    return "Current Folder";
  };

  // Move mutations
  const moveFileMutation = trpc.file.move.useMutation({
    onSuccess: () => {
      toast.success(`${itemName} moved successfully`);
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const moveFolderMutation = trpc.folder.move.useMutation({
    onSuccess: () => {
      toast.success(`${itemName} moved successfully`);
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleOpenMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange?.(false); // Close the dropdown menu
    setIsOpen(true);
    setCurrentFolderId_nav(currentFolderId || null);
    setSelectedFolderId(currentFolderId || null);
    setBreadcrumbs([]); // Will be built from the folder data when it loads
  };

  const handleFolderClick = (folder: SimpleFolder) => {
    setCurrentFolderId_nav(folder.id);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root - get the root folder ID from parent hierarchy
      const rootFolder = parentHierarchyQuery.data?.find(f => f.parentFolderId === null);
      setCurrentFolderId_nav(rootFolder?.id || null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolderId_nav(newBreadcrumbs[newBreadcrumbs.length - 1]?.id || null);
    }
  };

  const handleMove = () => {
    if (!selectedFolderId) {
      toast.error("Please select a destination folder");
      return;
    }

    console.log("Moving item:", { itemType, itemId, selectedFolderId, classId });

    if (itemType === "file") {
      moveFileMutation.mutate({
        fileId: itemId,
        targetFolderId: selectedFolderId,
        classId,
      });
    } else {
      moveFolderMutation.mutate({
        folderId: itemId,
        targetParentFolderId: selectedFolderId,
        classId,
      });
    }
  };

  const folders = currentFolderData?.childFolders?.filter(f => 
    itemType !== "folder" || f.id !== itemId
  ).map(f => ({ id: f.id, name: f.name, color: f.color })) || [];

  const canMoveHere = selectedFolderId !== currentFolderId;

  return (
    <>
      <div 
        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        onClick={handleOpenMove}
        role="menuitem"
      >
        <Move className="mr-2 h-4 w-4" />
        Move
      </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[650px] p-0">
            <DialogHeader className="px-6 py-4 border-b bg-muted/20">
              <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Move className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span>Move item</span>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    Choose a new location for "{itemName}"
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

             <div className="flex flex-col h-full">
               {/* Navigation Bar - OneDrive style */}
               <div className="px-6 py-3 bg-muted/10 border-b">
                 {parentHierarchyQuery.isLoading ? (
                   // Loading skeleton for breadcrumbs
                   <div className="flex items-center gap-1">
                     <div className="h-8 w-16 bg-muted/50 rounded-md animate-pulse" />
                     <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                     <div className="h-8 w-24 bg-muted/50 rounded-md animate-pulse" />
                   </div>
                 ) : (
                   <div className="flex items-center gap-1 text-sm">
                     <button 
                       onClick={() => handleBreadcrumbClick(-1)} 
                       className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors font-medium"
                     >
                       <Home className="h-4 w-4" />
                       <span>Files</span>
                     </button>
                     {breadcrumbs.map((crumb, index) => {
                       const isLast = index === breadcrumbs.length - 1;
                       const isCurrent = crumb.id === currentFolderId_nav;
                       
                       return (
                         <div key={crumb.id} className="flex items-center">
                           <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                           {isCurrent ? (
                             // Current folder - highlight it
                             <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-md font-medium text-sm">
                               {crumb.name}
                             </span>
                           ) : (
                             // Navigable folder
                             <button 
                               onClick={() => handleBreadcrumbClick(index)}
                               className="px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors font-medium truncate max-w-[140px]"
                               title={crumb.name}
                             >
                               {crumb.name}
                             </button>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>

              {/* Current Location Header */}
              <div className="px-6 py-4 bg-background border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/20 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">
                        {getCurrentFolderName()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {folders.length} folder{folders.length !== 1 ? 's' : ''} • Choose destination
                      </p>
                    </div>
                  </div>
                  
                  {/* Select current folder button */}
                  <Button
                    variant={selectedFolderId === currentFolderId_nav ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedFolderId(currentFolderId_nav)}
                    className="min-w-[100px]"
                  >
                    {selectedFolderId === currentFolderId_nav ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Folder className="h-4 w-4 mr-2" />
                        Select Here
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Folder List */}
              <div className="flex-1 px-6 py-2">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                          <div className="h-10 w-10 bg-muted/50 rounded-lg" />
                          <div className="flex-1">
                            <div className="h-4 bg-muted/50 rounded w-32 mb-1" />
                            <div className="h-3 bg-muted/30 rounded w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : folders.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Folders ({folders.length})
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
                        {folders.map((folder) => {
                          const isSelected = selectedFolderId === folder.id;
                          return (
                            <div
                              key={folder.id}
                              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/20 ${
                                isSelected
                                  ? 'bg-primary/5 border border-primary/20 shadow-sm'
                                  : 'hover:shadow-sm border border-transparent hover:border-border/50'
                              }`}
                              onClick={() => setSelectedFolderId(folder.id)}
                              onDoubleClick={() => handleFolderClick(folder as SimpleFolder)}
                            >
                              <div className="relative flex-shrink-0">
                                <div className="p-2 bg-muted/10 rounded-lg">
                                  <Folder 
                                    className="h-5 w-5 fill-current" 
                                    style={{ color: folder.color || '#3b82f6' }}
                                  />
                                </div>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate text-foreground">{folder.name}</p>
                                <p className="text-xs text-muted-foreground">Double-click to open</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                                    Selected
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFolderClick(folder as SimpleFolder);
                                  }}
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Open folder"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-6 bg-muted/10 rounded-full mb-4">
                        <Folder className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-base mb-2">No folders here</h3>
                      <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
                        This location doesn't contain any folders. You can still select this location as the destination.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-muted/5 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {selectedFolderId ? (
                      <>
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                        <p className="text-sm text-muted-foreground">Ready to move</p>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <p className="text-sm text-muted-foreground">Select a destination</p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={moveFileMutation.isPending || moveFolderMutation.isPending}
                      className="min-w-[80px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleMove}
                      disabled={!selectedFolderId || !canMoveHere || moveFileMutation.isPending || moveFolderMutation.isPending}
                      className="min-w-[120px]"
                    >
                      {(moveFileMutation.isPending || moveFolderMutation.isPending) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Moving...
                        </>
                      ) : (
                        <>
                          <Move className="h-4 w-4 mr-2" />
                          Move Here
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
