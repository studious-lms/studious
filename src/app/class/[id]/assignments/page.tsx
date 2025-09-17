"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DndProvider, DropTargetMonitor, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Folder
} from "lucide-react";
import { AssignmentFolder } from "@/components/AssignmentFolder";
import { DraggableAssignment } from "@/components/DraggableAssignment";
import { CreateAssignmentModal, CreateSectionModal } from "@/components/modals";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentCardSkeleton } from "@/components/ui/class-card-skeleton";
import { RouterOutputs, trpc } from "@/lib/trpc";

type Assignment = RouterOutputs['assignment']['get'];

type Folder = {
  id: string;
  name: string;
  isOpen: boolean;
  color: string;
  assignments: Assignment[];
};
// Unified droppable slot component for both assignments and folders
function DroppableItemSlot({ 
  children, 
  index, 
  onMoveItem 
}: { 
  children: React.ReactNode;
  index: number;
  onMoveItem: (draggedId: string, draggedType: string, targetIndex: number) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: ["assignment", "folder"],
    drop: (item: { id: string; type?: string }, monitor: DropTargetMonitor) => {
      if (monitor.didDrop()) return;
      const itemType = item.type || "assignment";
      onMoveItem(item.id, itemType, index);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="relative">
      {isOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
      )}
      {children}
    </div>
  );
}

// Main drop zone component
function MainDropZone({ 
  children, 
  onMoveAssignment 
}: { 
  children: React.ReactNode;
  onMoveAssignment: (assignmentId: string, targetFolderId: string | null) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "assignment",
    drop: (item: { id: string }, monitor: DropTargetMonitor) => {
      if (monitor.isOver({ shallow: true })) {
        console.log('Dropping assignment to top level:', item.id);
        onMoveAssignment(item.id, null); // Move to top-level
      }
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div 
      ref={drop as unknown as React.Ref<HTMLDivElement>} 
      className={`relative min-h-[400px] py-4 transition-all duration-200 ${
        isOver ? 'bg-muted/20 border-2 border-dashed border-primary rounded-lg' : ''
      }`}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg border-2 border-dashed border-primary">
            Drop assignment here to move to top level
          </div>
        </div>
      )}
    </div>
  );
}

export default function Assignments() {
  const params = useParams();
  const classId = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [topLevelItems, setTopLevelItems] = useState<Array<{type: 'assignment' | 'folder', data: Assignment | Folder}>>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // API queries
  const { data: classData, isLoading, refetch } = trpc.class.get.useQuery({ classId });
  
  // Initialize topLevelItems with real data from API
  useEffect(() => {
    if (classData?.class) {
      const assignments = classData.class.assignments || [];
      const sections = classData.class.sections || [];
      
      // Create folder items from sections with their assignments
      const folderItems = sections.map(section => {
        const sectionAssignments = assignments
          .filter(assignment => assignment.section && assignment.section.id === section.id)
          .map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            type: assignment.type?.toLowerCase() || 'homework',
            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : null,
            status: assignment.graded ? 'graded' : 'pending',
            submissions: assignment.submissions?.length || 0,
            totalStudents: classData.class.students?.length || 0,
            hasAttachments: (assignment.attachments?.length || 0) > 0,
            points: assignment.maxGrade || 0,
            description: assignment.instructions || ''
          }));

        return { 
          type: 'folder' as const, 
          data: {
            id: section.id,
            name: section.name,
            isOpen: openSections[section.id] ?? true,
            color: "blue",
            assignments: sectionAssignments
          }
        };
      });
      
      // Get assignments not in any section (top-level)
      const topLevelAssignments = assignments.filter(assignment => !assignment.section);
      const assignmentItems = topLevelAssignments.map(assignment => ({ 
        type: 'assignment' as const, 
        data: {
          id: assignment.id,
          title: assignment.title,
          type: assignment.type?.toLowerCase() || 'homework',
          dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : null,
          status: assignment.graded ? 'graded' : 'pending',
          submissions: assignment.submissions?.length || 0,
          totalStudents: classData.class.students?.length || 0,
          hasAttachments: (assignment.attachments?.length || 0) > 0,
          points: assignment.maxGrade || 0,
          description: assignment.instructions || ''
        }
      }));
      
      setTopLevelItems([...assignmentItems, ...folderItems]);
    }
  }, [classData, openSections]);

  const filteredTopLevelItems = topLevelItems.filter(item => {
    if (item.type === 'folder') {
      const folder = item.data;
      return folder.assignments.some((assignment: Assignment) =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) || folder.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const assignment = item.data as Assignment;
      return assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const moveItem = (draggedId: string, draggedType: string, targetIndex: number) => {
    setTopLevelItems(prev => {
      const items = [...prev];
      const currentIndex = items.findIndex(item => 
        item.data.id === draggedId && item.type === draggedType
      );
      
      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        const [movedItem] = items.splice(currentIndex, 1);
        items.splice(targetIndex, 0, movedItem);
      }
      
      return items;
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <AssignmentCardSkeleton count={6} />
        </div>
      </PageLayout>
    );
  }

  const moveAssignment = (assignmentId: string, targetFolderId: string | null, targetIndex?: number) => {
    // Find the assignment in top-level items or folders
    let assignment = null;
    let sourceLocation: 'toplevel' | 'folder' | null = null;
    let sourceFolderId = null;
    
    // Check top-level items first
    const topLevelAssignment = topLevelItems.find(item => 
      item.type === 'assignment' && item.data.id === assignmentId
    );
    if (topLevelAssignment) {
      assignment = topLevelAssignment.data;
      sourceLocation = 'toplevel';
    }
    
    // Check folders if not found in top-level
    if (!assignment) {
      for (const item of topLevelItems) {
        if (item.type === 'folder') {
          const found = item.data.assignments.find((a: Assignment) => a.id === assignmentId);
          if (found) {
            assignment = found;
            sourceLocation = 'folder';
            sourceFolderId = item.data.id;
            break;
          }
        }
      }
    }
    
    if (!assignment) return;
    
    // If moving to top-level (targetFolderId is null)
    if (targetFolderId === null) {
      if (sourceLocation === 'toplevel') {
        // Already at top-level, just reorder if targetIndex is provided
        if (targetIndex !== undefined) {
          setTopLevelItems(prev => {
            const items = [...prev];
            const currentIndex = items.findIndex(item => 
              item.type === 'assignment' && item.data.id === assignmentId
            );
            if (currentIndex !== -1) {
              const [movedItem] = items.splice(currentIndex, 1);
              items.splice(targetIndex, 0, movedItem);
            }
            return items;
          });
        }
        return;
      }
      
      // Moving from folder to top-level
      if (sourceLocation === 'folder') {
        // Remove from folder
        setTopLevelItems(prev => 
          prev.map(item => 
            item.type === 'folder' && item.data.id === sourceFolderId
              ? { 
                  ...item, 
                  data: { 
                    ...item.data, 
                    assignments: item.data.assignments.filter((a: Assignment) => a.id !== assignmentId) 
                  }
                }
              : item
          )
        );
        
        // Add to top-level
        const newItem = { type: 'assignment' as const, data: assignment };
        if (targetIndex !== undefined) {
          setTopLevelItems(prev => {
            const items = [...prev];
            items.splice(targetIndex, 0, newItem);
            return items;
          });
        } else {
          setTopLevelItems(prev => [...prev, newItem]);
        }
      }
      return;
    }
    
    // Moving to a folder
    if (sourceLocation === 'toplevel') {
      // Remove from top-level
      setTopLevelItems(prev => prev.filter(item => 
        !(item.type === 'assignment' && item.data.id === assignmentId)
      ));
    } else if (sourceLocation === 'folder') {
      // Remove from source folder
      setTopLevelItems(prev => 
        prev.map(item => 
          item.type === 'folder' && item.data.id === sourceFolderId
            ? { 
                ...item, 
                data: { 
                  ...item.data, 
                  assignments: item.data.assignments.filter((a: Assignment) => a.id !== assignmentId) 
                }
              }
            : item
        )
      );
    }
    
    // Add to target folder
    setTopLevelItems(prev => 
      prev.map(item => 
        item.type === 'folder' && item.data.id === targetFolderId
          ? { 
              ...item, 
              data: { 
                ...item.data, 
                assignments: targetIndex !== undefined 
                  ? [...item.data.assignments.slice(0, targetIndex), assignment, ...item.data.assignments.slice(targetIndex)]
                  : [...item.data.assignments, assignment]
              }
            }
          : item
      )
    );
  };

  const handleSectionCreated = () => {
    refetch(); // Refresh class data to get new section
  };

  const handleAssignmentCreated = () => {
    refetch();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Manage and track class assignments</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <CreateSectionModal classId={classId} onSectionCreated={handleSectionCreated}>
              <Button variant="outline" size="sm">
                <Folder className="h-4 w-4 mr-2" />
                New Section
              </Button>
            </CreateSectionModal>
            <CreateAssignmentModal onAssignmentCreated={handleAssignmentCreated}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </CreateAssignmentModal>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Assignments Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredTopLevelItems.length > 0 ? (
              <MainDropZone onMoveAssignment={moveAssignment}>
                <div className="space-y-6">
                  {filteredTopLevelItems.map((item, index) => (
                    <DroppableItemSlot 
                      key={`${item.type}-${item.data.id}`}
                      index={index}
                      onMoveItem={moveItem}
                    >
                      {item.type === 'assignment' ? (
                        <DraggableAssignment
                          assignment={item.data as Assignment}
                          classId={classId!}
                        />
                      ) : (
                        <AssignmentFolder
                          folder={item.data as Folder}
                          classId={classId!}
                          isOpen={openSections[item.data.id]}
                          onToggle={() => toggleSection(item.data.id)}
                          onMoveAssignment={moveAssignment}
                        />
                      )}
                    </DroppableItemSlot>
                  ))}
                </div>
              </MainDropZone>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? `No assignments match "${searchQuery}"` : "Create your first assignment to get started"}
                  </p>
                  <CreateAssignmentModal onAssignmentCreated={handleAssignmentCreated}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </CreateAssignmentModal>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </PageLayout>
    </DndProvider>
  );
}