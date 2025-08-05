"use client";

import { useEffect, useState } from "react";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addAlert, openModal, setRefetch } from "@/store/appSlice";
import Loading from "@/components/Loading";
import CreateAssignment from "@/components/class/forms/CreateAssignment";
import Empty from "@/components/ui/Empty";
import CreateSection from "@/components/class/forms/CreateSection";
import { HiClipboardList, HiFilter, HiPlus, HiSearch, HiUserGroup } from "react-icons/hi";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { RouterOutputs } from "@/utils/trpc";

import Button from "@/components/ui/Button";
import Assignment from "@/components/class/Assignment";
import Section from "@/components/class/Section";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";
import Tabs, { Tab } from "@/components/ui/Tabs";

type Section = {
    id: string;
    name: string;
};

type FilterState = {
    search: string;
    status: 'all' | 'submitted' | 'late' | 'returned' | 'pending';
    dueDate: 'all' | 'today' | 'week' | 'month';
};

type AssignmentType = RouterOutputs['class']['get']['class']['assignments'][number];

// Skeleton component for assignment items
const AssignmentSkeleton = () => (
    <Card className="p-4">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <SkeletonText lines={2} className="mb-2" />
                <div className="flex items-center space-x-4">
                    <Skeleton width="4rem" height="1.5rem" />
                    <Skeleton width="6rem" height="1.5rem" />
                    <Skeleton width="5rem" height="1.5rem" />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton width="2rem" height="2rem" />
                <Skeleton width="2rem" height="2rem" />
            </div>
        </div>
    </Card>
);

// Skeleton component for section headers
const SectionSkeleton = () => (
    <div className="space-y-3">
        <div className="flex items-center space-x-2">
            <Skeleton width="8rem" height="1.5rem" />
            <Skeleton width="3rem" height="1.5rem" />
        </div>
        <div className="space-y-2">
            <AssignmentSkeleton />
            <AssignmentSkeleton />
        </div>
    </div>
);

// Skeleton for the entire assignments page
const AssignmentsPageSkeleton = () => (
    <div className="flex flex-col space-y-6">
        {/* Title skeleton */}
        <Skeleton width="8rem" height="2rem" />
        
        {/* Tabs skeleton */}
        <div className="flex flex-row space-x-2 border-b border-border mb-2">
            {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} width="4rem" height="2.5rem" />
            ))}
        </div>

        {/* Search and filters skeleton */}
        <div className="flex flex-row justify-between items-center mb-5">
            <div className="flex flex-row items-center space-x-4">
                <Skeleton width="16rem" height="2.5rem" />
            </div>
            <div className="flex flex-row space-x-2">
                <Skeleton width="5rem" height="2.5rem" />
                <Skeleton width="6rem" height="2.5rem" />
                <Skeleton width="7rem" height="2.5rem" />
            </div>
        </div>

        {/* Assignment list skeleton */}
        <div className="flex flex-col space-y-3 p-3">
            <SectionSkeleton />
            <AssignmentSkeleton />
            <AssignmentSkeleton />
            <AssignmentSkeleton />
        </div>
    </div>
);

export default function AssignmentListPage({ params }: { params: { classId: string } }) {
    const classId = params.classId;

    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    const [assignments, setAssignments] = useState<AssignmentType[] | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        status: 'all',
        dueDate: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const { data: classData, isLoading, refetch } = trpc.class.get.useQuery({ classId });

    // Handle Redux refetch requests
    useEffect(() => {
        if (appState.refetch) {
            refetch();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch, refetch, dispatch]);

    // Fetch initial data
    useEffect(() => {
        if (classData) {
            setAssignments([...classData.class.assignments]);
            setSections([...classData.class.sections]);
        }
    }, [classData]);

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        
        // Join the class room
        joinClass(classId);

        // Handle assignment updates
        socket.on('assignment-updated', (updatedAssignment: AssignmentType, ack) => {
            setAssignments(prevAssignments => {
                if (!prevAssignments) return [updatedAssignment];
                
                const index = prevAssignments.findIndex(a => a.id === updatedAssignment.id);
                if (index === -1) {
                    return [...prevAssignments, updatedAssignment];
                }
                
                const newAssignments = [...prevAssignments];
                newAssignments[index] = updatedAssignment;
                return newAssignments;
            });
            if (ack) ack();
        });

        // Handle new assignments
        socket.on('assignment-created', (newAssignment: AssignmentType, ack) => {
            setAssignments(prevAssignments => {
                if (!prevAssignments) return [newAssignment];
                return [...prevAssignments, newAssignment];
            });
            if (ack) ack();
        });

        // Handle assignment deletions
        socket.on('assignment-deleted', (deletedAssignmentId: string, ack) => {
            setAssignments(prevAssignments => {
                if (!prevAssignments) return null;
                return prevAssignments.filter(a => a.id !== deletedAssignmentId);
            });
            if (ack) ack();
        });

        // Handle section creation
        socket.on('section-created', (newSection: Section, ack) => {
            setSections(prevSections => {
                if (!prevSections) return [newSection];
                return [...prevSections, newSection];
            });

            if (ack) ack();
        });

        // Handle section updates
        socket.on('section-updated', (updatedSection: Section, ack) => {
            setSections(prevSections => {
                if (!prevSections) return [updatedSection];
                
                const index = prevSections.findIndex(s => s.id === updatedSection.id);
                if (index === -1) {
                    return [...prevSections, updatedSection];
                }
                
                const newSections = [...prevSections];
                newSections[index] = updatedSection;
                return newSections;
            });
            if (ack) ack();
        });

        // Handle section deletions
        socket.on('section-deleted', (deletedSectionId: string, ack) => {
            setSections(prevSections => {
                if (!prevSections) return [];
                return prevSections.filter(s => s.id !== deletedSectionId);
            });
            if (ack) ack();
        });

        // Cleanup on unmount
        return () => {
            leaveClass(classId);
            socket.off('assignment-updated');
            socket.off('assignment-created');
            socket.off('assignment-deleted');
            socket.off('section-created');
            socket.off('section-updated');
            socket.off('section-deleted');
        };
    }, [classId]);

    const filterAssignments = (assignments: AssignmentType[]) => {
        if (!assignments) return [];
        
        return assignments.filter(assignment => {
            // Search filter
            if (filters.search && !assignment.title.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Status filter
            if (filters.status !== 'all') {
                switch (filters.status) {
                    case 'submitted':
                        if (!assignment.submitted) return false;
                        break;
                    case 'late':
                        if (!assignment.late) return false;
                        break;
                    case 'returned':
                        if (!assignment.returned) return false;
                        break;
                    case 'pending':
                        if (assignment.submitted || assignment.late || assignment.returned) return false;
                        break;
                }
            }

            // Due date filter
            if (filters.dueDate !== 'all' && assignment.dueDate) {
                const now = new Date();
                const dueDate = new Date(assignment.dueDate);
                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (filters.dueDate) {
                    case 'today':
                        if (diffDays !== 0) return false;
                        break;
                    case 'week':
                        if (diffDays < 0 || diffDays > 7) return false;
                        break;
                    case 'month':
                        if (diffDays < 0 || diffDays > 30) return false;
                        break;
                }
            }

            return true;
        });
    };

    const filterSections = (sections: Section[]) => {
        if (!sections) return [];
        
        return sections.filter(section => {
            // Only show sections that have assignments matching the current tab filter
            const sectionAssignments = assignments?.filter(a => a.section?.id === section.id) || [];
            return sectionAssignments.some(tabFilters[activeTab]);
        });
    };

    // Show skeleton loading instead of spinner
    if (isLoading || !assignments) {
        return <AssignmentsPageSkeleton />;
    }

    // --- Summary counts ---
    const summary = {
        pending: assignments.filter(a => !a.submitted && !a.late && !a.returned).length,
        submitted: assignments.filter(a => a.submitted && !a.returned).length,
        graded: assignments.filter(a => a.returned).length,
        overdue: assignments.filter(a => a.late && !a.submitted).length,
    };

    // --- Tab state ---
    const tabFilters = [
        () => true, // all
        (a: AssignmentType) => !a.submitted && !a.late && !a.returned, // pending
        (a: AssignmentType) => a.submitted && !a.returned, // submitted
        (a: AssignmentType) => a.returned, // graded
        (a: AssignmentType) => a.late && !a.submitted, // overdue
    ];

    const tabs: Tab[] = [
        { name: 'All', count: assignments.length },
        { name: 'Pending', count: summary.pending },
        { name: 'Submitted', count: summary.submitted },
        { name: 'Graded', count: summary.graded },
        { name: 'Overdue', count: summary.overdue },
    ];

    const filteredAssignments = filterAssignments(assignments).filter(tabFilters[activeTab]);
    const filteredSections = filterSections(sections);

    return (
        <div className="flex flex-col space-y-6">
            <span className="text-xl font-bold">Assignments</span>
            {/* --- Dashboard Summary Cards --- */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="flex flex-col items-start justify-center p-5">
                    <div className="font-semibold text-lg">Pending</div>
                    <div className="text-3xl font-bold">{summary.pending}</div>
                    <div className="text-sm text-gray-500">Assignments to complete</div>
                </Card>
                <Card className="flex flex-col items-start justify-center p-5">
                    <div className="font-semibold text-lg">Submitted</div>
                    <div className="text-3xl font-bold">{summary.submitted}</div>
                    <div className="text-sm text-gray-500">Awaiting grades</div>
                </Card>
                <Card className="flex flex-col items-start justify-center p-5">
                    <div className="font-semibold text-lg">Graded</div>
                    <div className="text-3xl font-bold">{summary.graded}</div>
                    <div className="text-sm text-gray-500">Completed assignments</div>
                </Card>
                <Card className="flex flex-col items-start justify-center p-5">
                    <div className="font-semibold text-lg">Overdue</div>
                    <div className="text-3xl font-bold">{summary.overdue}</div>
                    <div className="text-sm text-gray-500">Need attention</div>
                </Card>
            </div> */}

            {/* --- Tabs --- */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* --- Search and Filters --- */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
                <div className="flex flex-row items-center space-x-4">
                    <div className="relative flex-1 sm:flex-none">
                        <Input.Text
                            placeholder="Search assignments..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full sm:w-64 pl-10"
                        />
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
                    </div>
                </div>
                <div className="flex flex-row flex-wrap gap-2">
                    <div className="relative">
                        <Button.Light
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <HiFilter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </Button.Light>
                        {showFilters && (
                            <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg p-4 z-10">
                                <div className="flex flex-col space-y-4">
                                    {!appState.user.teacher && (
                                        <div className="flex flex-col space-y-2">
                                            <label className="text-sm font-medium">Status</label>
                                            <Input.Select
                                                value={filters.status}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterState['status'] })}
                                            >
                                                <option value="all">All</option>
                                                <option value="submitted">Submitted</option>
                                                <option value="late">Late</option>
                                                <option value="returned">Returned</option>
                                                <option value="pending">Pending</option>
                                            </Input.Select>
                                        </div>
                                    )}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium">Due Date</label>
                                        <Input.Select
                                            value={filters.dueDate}
                                            onChange={(e) => setFilters({ ...filters, dueDate: e.target.value as FilterState['dueDate'] })}
                                        >
                                            <option value="all">All</option>
                                            <option value="today">Due Today</option>
                                            <option value="week">Due This Week</option>
                                            <option value="month">Due This Month</option>
                                        </Input.Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {appState.user.teacher && (
                        <>
                            <Button.Light
                                onClick={() => dispatch(openModal({body: <CreateSection classId={classId} />, header: 'Create Section'}))}
                                className="flex flex-row items-center gap-2"
                            >
                                <HiUserGroup className="w-4 h-4" />
                                <span className="hidden sm:inline">Section</span>
                            </Button.Light>
                            <Button.Primary
                                onClick={() => dispatch(openModal({body: <CreateAssignment classId={classId} sections={sections} />, header: 'Create Assignment'}))}
                                className="flex flex-row items-center gap-2"
                            >
                                <HiPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Assignment</span>
                            </Button.Primary>
                        </>
                    )}
                </div>
            </div>

            {/* --- Assignment List --- */}
            <div className="flex flex-col space-y-3">
                {filteredAssignments.length === 0 && filteredSections.length ===0 && (
                    <Empty 
                        icon={HiClipboardList}
                        title="No Assignments"
                        description="No assignments match your current filters."
                    />
                )}
                {filteredSections && filteredSections.map((section: Section) => {
                    const sectionAssignments = filteredAssignments.filter((assignment: AssignmentType) => 
                        assignment && 
                        assignment.section && 
                        assignment.section.id === section.id
                    );
                    return (
                        <Section
                            section={section}
                            assignments={sectionAssignments}
                            key={section.id}
                            classId={classId}
                            isTeacher={appState.user.teacher}
                        />
                    );
                })}
                {filteredAssignments.filter(assignment => 
                    assignment && 
                    (!assignment.section || !assignment.section.id)
                ).map((assignment: AssignmentType) => (
                    <Assignment
                        key={assignment.id}
                        title={assignment.title}
                        date={assignment.dueDate!}
                        isTeacher={appState.user.teacher}
                        classId={classId}
                        assignmentId={assignment.id}
                        late={assignment.late}
                        submitted={assignment.submitted}
                        returned={assignment.returned}
                        points={assignment.maxGrade ?? undefined}
                        type={assignment.type}
                        graded={assignment.graded}
                        inProgress={assignment.inProgress}
                    />
                ))}
            </div>
        </div>
    )
}