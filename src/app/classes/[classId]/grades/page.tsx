"use client";

import Input from "@/components/ui/Input";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, openModal } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdAssignment, MdPeople, MdGrade, MdChecklist, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Empty from "@/components/ui/Empty";
import ProfilePicture from "@/components/ui/ProfilePicture";
import Button from "@/components/ui/Button";
import { trpc } from "@/utils/trpc";
import type { RouterOutputs } from "@/utils/trpc";
import { emitAssignmentUpdate, getSocket, joinClass, leaveClass } from "@/lib/socket";
import { DataTable } from "@/components/ui/DataTable";
import Checkbox from "@/components/ui/Checkbox";
import Card from "@/components/ui/Card";
import Rubric, { RubricCriteria } from "@/components/ui/Rubric";
import GradingBoundaries, { GradeBoundary } from "@/components/ui/GradingBoundaries";
import CreateMarkscheme from "@/components/class/forms/CreateMarkscheme";
import CreateGradingBoundary from "@/components/class/forms/CreateGradingBoundary";
import { HiClipboardCheck, HiClipboardList } from "react-icons/hi";
import Skeleton, { SkeletonAvatar } from "@/components/ui/Skeleton";

type Assignment = RouterOutputs['class']['get']['class']['assignments'][number];
type User = RouterOutputs['class']['get']['class']['students'][number];

// Skeleton component for data table header
const DataTableHeaderSkeleton = () => (
    <thead className="bg-muted/50">
        <tr>
            {Array.from({ length: 5 }).map((_, index) => (
                <th key={index} className="px-6 py-3.5 text-left">
                    <Skeleton width="6rem" height="1rem" />
                </th>
            ))}
        </tr>
    </thead>
);

// Skeleton component for data table row
const DataTableRowSkeleton = () => (
    <tr className="border-b border-border">
        {Array.from({ length: 5 }).map((_, index) => (
            <td key={index} className="px-6 py-4">
                <Skeleton width="8rem" height="1rem" />
            </td>
        ))}
    </tr>
);

// Skeleton component for data table
const DataTableSkeleton = () => (
    <div className="overflow-hidden rounded-lg border border-border bg-base shadow-sm">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
                <DataTableHeaderSkeleton />
                <tbody className="divide-y divide-border bg-base">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <DataTableRowSkeleton key={index} />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Skeleton component for grading tools
const GradingToolsSkeleton = () => (
    <div className="space-y-6 mb-6">
        {/* Markschemes skeleton */}
        <Card className="flex flex-col space-y-4 p-6">
            <div className="flex items-center justify-between">
                <Skeleton width="8rem" height="1.25rem" />
                <Skeleton width="8rem" height="2.5rem" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                        <div className="flex items-center space-x-4">
                            <Skeleton width="1.25rem" height="1.25rem" />
                            <Skeleton width="12rem" height="1rem" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton width="2rem" height="2rem" />
                            <Skeleton width="2rem" height="2rem" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* Grading boundaries skeleton */}
        <Card className="flex flex-col space-y-4 p-6">
            <div className="flex items-center justify-between">
                <Skeleton width="10rem" height="1.25rem" />
                <Skeleton width="8rem" height="2.5rem" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                        <div className="flex items-center space-x-4">
                            <Skeleton width="1.25rem" height="1.25rem" />
                            <Skeleton width="12rem" height="1rem" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton width="2rem" height="2rem" />
                            <Skeleton width="2rem" height="2rem" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

// Skeleton component for page header
const PageHeaderSkeleton = () => (
    <div className="flex items-center justify-between mb-6">
        <Skeleton width="6rem" height="1.5rem" />
    </div>
);

// Skeleton component for students section
const StudentsSkeleton = () => (
    <Card className="flex flex-col space-y-4 p-6">
        <Skeleton width="6rem" height="1.25rem" />
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                    <div className="flex items-center space-x-4">
                        <SkeletonAvatar size="md" />
                        <Skeleton width="8rem" height="1rem" />
                    </div>
                    <Skeleton width="6rem" height="1rem" />
                </div>
            ))}
        </div>
    </Card>
);

// Skeleton for the entire grades page
const GradesPageSkeleton = () => (
    <div className="flex flex-col space-y-6">
        <PageHeaderSkeleton />
        <DataTableSkeleton />
        <GradingToolsSkeleton />
        <StudentsSkeleton />
    </div>
);

export default function EditGrades({ params }: { params: { classId: string } }) {
	const [assignments, setAssignments] = useState<(Assignment & { edited: boolean })[]>([]);
	const [students, setStudents] = useState<User[]>([]);
	const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
	const [gradeBoundaries, setGradeBoundaries] = useState<GradeBoundary[]>([]);
	const [markschemes, setMarkschemes] = useState<any[]>([]);
	const [gradingBoundaries, setGradingBoundaries] = useState<any[]>([]);
	const [previewMarkscheme, setPreviewMarkscheme] = useState<any>(null);
	const [previewGradingBoundary, setPreviewGradingBoundary] = useState<any>(null);
	const dispatch = useDispatch();
	const appState = useSelector((state: RootState) => state.app);

	const { data: classData, refetch, isLoading: classLoading } = trpc.class.get.useQuery({ classId: params.classId });
	const { data: markschemesData, refetch: refetchMarkschemes, isLoading: markschemesLoading } = trpc.class.listMarkSchemes.useQuery({ classId: params.classId });
	const { data: gradingBoundariesData, refetch: refetchGradingBoundaries, isLoading: gradingBoundariesLoading } = trpc.class.listGradingBoundaries.useQuery({ classId: params.classId });

	useEffect(() => {
		if (classData?.class) {
			setAssignments([
				...classData.class.assignments.map((assignment: Assignment) => ({ ...assignment, edited: false }))
			]);
			setStudents([
				...classData.class.students
			]);
		}
	}, [classData]);

	useEffect(() => {
		if (markschemesData) {
			setMarkschemes(markschemesData);
		}
	}, [markschemesData]);

	useEffect(() => {
		if (gradingBoundariesData) {
			setGradingBoundaries(gradingBoundariesData);
		}
	}, [gradingBoundariesData]);

	// Socket setup
	useEffect(() => {
		const socket = getSocket();

		// Join class room
		joinClass(params.classId);

		// Listen for assignment updates
		socket.on('assignment-updated', (updatedAssignment: Assignment) => {
			setAssignments(prev => prev.map(assignment =>
				assignment.id === updatedAssignment.id
					? { ...updatedAssignment, edited: false }
					: assignment
			));
		});

		// Listen for assignment creation
		socket.on('assignment-created', (newAssignment: Assignment) => {
			setAssignments(prev => [...prev, { ...newAssignment, edited: false }]);
		});

		// Listen for assignment deletion
		socket.on('assignment-deleted', (deletedAssignmentId: string) => {
			setAssignments(prev => prev.filter(assignment => assignment.id !== deletedAssignmentId));
		});

		// Listen for grade updates
		socket.on('submission-updated', (updatedSubmission: any) => {
			// Refresh the class data to get updated grades
			refetch();
		});

		// Cleanup
		return () => {
			leaveClass(params.classId);
			socket.off('assignment-updated');
			socket.off('assignment-created');
			socket.off('assignment-deleted');
			socket.off('submission-updated');
		};
	}, [params.classId, refetch]);

	const updateAssignment = trpc.assignment.update.useMutation({
		onSuccess: () => {
			refetch();
		},
		onError: (error) => {
			dispatch(addAlert({
				level: AlertLevel.ERROR,
				remark: error.message || 'Error occurred while updating assignments'
			}));
		}
	});

	const deleteMarkscheme = trpc.class.deleteMarkScheme.useMutation({
		onSuccess: () => {
			refetchMarkschemes();
			dispatch(addAlert({
				level: AlertLevel.SUCCESS,
				remark: 'Markscheme deleted successfully'
			}));
		},
		onError: (error) => {
			dispatch(addAlert({
				level: AlertLevel.ERROR,
				remark: error.message || 'Error occurred while deleting markscheme'
			}));
		}
	});

	const deleteGradingBoundary = trpc.class.deleteGradingBoundary.useMutation({
		onSuccess: () => {
			refetchGradingBoundaries();
			dispatch(addAlert({
				level: AlertLevel.SUCCESS,
				remark: 'Grading boundary deleted successfully'
			}));
		},
		onError: (error) => {
			dispatch(addAlert({
				level: AlertLevel.ERROR,
				remark: error.message || 'Error occurred while deleting grading boundary'
			}));
		}
	});

	const handleValueChange = (index: number, field: string, value: any) => {
		const updatedAssignments = [...assignments];
		updatedAssignments[index] = {
			...updatedAssignments[index],
			[field]: value,
			edited: true
		};
		setAssignments(updatedAssignments);
	};

	const handleCreateMarkscheme = () => {
		dispatch(openModal({
			header: 'Create Markscheme',
			body: <CreateMarkscheme classId={params.classId} onSuccess={refetchMarkschemes} />
		}));
	};

	const handleEditMarkscheme = (markscheme: any) => {
		dispatch(openModal({
			header: 'Edit Markscheme',
			body: <CreateMarkscheme classId={params.classId} existingMarkscheme={markscheme} onSuccess={refetchMarkschemes} />
		}));
	};

	const handleDeleteMarkscheme = async (markschemeId: string) => {
		if (confirm('Are you sure you want to delete this markscheme? This action cannot be undone.')) {
			await deleteMarkscheme.mutateAsync({
				classId: params.classId,
				markSchemeId: markschemeId
			});
		}
	};

	const handleCreateGradingBoundary = () => {
		dispatch(openModal({
			header: 'Create Grading Boundary',
			body: <CreateGradingBoundary classId={params.classId} onSuccess={refetchGradingBoundaries} />
		}));
	};

	const handleEditGradingBoundary = (gradingBoundary: any) => {
		dispatch(openModal({
			header: 'Edit Grading Boundary',
			body: <CreateGradingBoundary classId={params.classId} existingGradingBoundary={gradingBoundary} onSuccess={refetchGradingBoundaries} />
		}));
	};

	const handleDeleteGradingBoundary = async (gradingBoundaryId: string) => {
		if (confirm('Are you sure you want to delete this grading boundary? This action cannot be undone.')) {
			await deleteGradingBoundary.mutateAsync({
				classId: params.classId,
				gradingBoundaryId: gradingBoundaryId
			});
		}
	};

	const handlePreviewMarkscheme = (markscheme: any) => {
		try {
			const parsed = JSON.parse(markscheme.structured);
			if (parsed.criteria) {
				setRubricCriteria(parsed.criteria);
			} else if (parsed.items) {
				// Convert old format to new format
				const convertedCriteria: RubricCriteria[] = parsed.items.map((item: any, index: number) => ({
					id: item.id || `criteria-${index}`,
					title: item.title || `Criteria ${index + 1}`,
					description: item.description || "",
					levels: [
						{
							id: "excellent",
							name: "Excellent",
							description: item.criteria?.[0] || "Outstanding performance",
							points: item.maxPoints || 4,
							color: "#4CAF50"
						},
						{
							id: "good",
							name: "Good",
							description: item.criteria?.[1] || "Good performance",
							points: Math.floor((item.maxPoints || 4) * 0.75),
							color: "#8BC34A"
						},
						{
							id: "satisfactory",
							name: "Satisfactory",
							description: item.criteria?.[2] || "Adequate performance",
							points: Math.floor((item.maxPoints || 4) * 0.5),
							color: "#FFEB3B"
						},
						{
							id: "needs-improvement",
							name: "Needs Improvement",
							description: item.criteria?.[3] || "Below expectations",
							points: Math.floor((item.maxPoints || 4) * 0.25),
							color: "#FF9800"
						}
					]
				}));
				setRubricCriteria(convertedCriteria);
			}
			setPreviewMarkscheme(markscheme);
		} catch (error) {
			console.error("Error parsing markscheme:", error);
		}
	};

	const handlePreviewGradingBoundary = (gradingBoundary: any) => {
		try {
			const parsed = JSON.parse(gradingBoundary.structured);
			setGradeBoundaries(parsed.boundaries || []);
			setPreviewGradingBoundary(gradingBoundary);
		} catch (error) {
			console.error("Error parsing grading boundary:", error);
		}
	};

	const closePreview = () => {
		setPreviewMarkscheme(null);
		setPreviewGradingBoundary(null);
		setRubricCriteria([]);
		setGradeBoundaries([]);
	};

	const saveChanges = async () => {
		const editedAssignments = assignments.filter(assignment => assignment.edited);

		// Use Promise.all to handle multiple requests concurrently
		const updatePromises = editedAssignments.map(assignment => {
			return updateAssignment.mutateAsync({
				classId: params.classId,
				id: assignment.id,
				title: assignment.title,
				instructions: assignment.instructions,
				dueDate: assignment.dueDate,
				graded: assignment.graded,
				maxGrade: assignment.maxGrade || 0,
				weight: assignment.weight || 0,
				sectionId: assignment.section?.id
			});
		});

		try {
			await Promise.all(updatePromises);
			editedAssignments.map(assignment => {
				emitAssignmentUpdate(params.classId, assignment);
			});
		} catch (error) {
			// Error handling is done in the mutation callbacks
		}
	};

	// Show skeleton loading if any data is loading
	if (classLoading || markschemesLoading || gradingBoundariesLoading) {
		return <GradesPageSkeleton />;
	}

	return (
		<div className="flex flex-col space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl text-foreground-primary">Grades</h1>
			</div>

			{/* Assignments Section */}
			<div className="w-full">
				{assignments.length > 0 ? (
					<>
						<DataTable
							className=" overflow-scroll"
							columns={[
								{
									header: "Title",
									accessor: "title"
								}
								,
								{
									header: "Due Date",
									accessor: "dueDate"
								},
								{
									header: "Graded",
									accessor: "graded",
									cell: (row, index) => {
										return <Checkbox checked={row.graded}
											onChange={(e) => handleValueChange(index, 'graded', e)}
										/>
									}
								},
								{
									header: "Max Score",
									accessor: "maxScore",
									cell: (row, index) => {
										return <>{row.graded ? (
											<Input.Text
												type="number"
												placeholder="Max grade"
												value={row.maxGrade!}
												className="!py-1.5 !px-3 w-full"
												onChange={(e) => handleValueChange(index, 'maxGrade', parseInt(e.target.value) || 0)}
											/>
										) : (
											<span className="flex justify-center">-</span>
										)}</>
									}
								},
								{
									header: "Weight",
									accessor: "weight",
									cell: (row, index) => {
										return <>
											{row.graded ? (
												<Input.Text
													type="number"
													placeholder="Weight"
													value={row.weight}
													className="!py-1.5 !px-3 w-full"
													onChange={(e) => handleValueChange(index, 'weight', parseInt(e.target.value) || 0)}
												/>
											) : (
												<span className="flex justify-center">-</span>
											)}
										</>
									}
								}
							]}
							data={assignments}
						/>
						{assignments.some(assignment => assignment.edited) && (
							<div className="mt-6 flex justify-end">
								<Button.Primary
									onClick={saveChanges}
									disabled={updateAssignment.isPending}
								>
									{updateAssignment.isPending ? 'Saving...' : 'Save Changes'}
								</Button.Primary>
							</div>
						)}
					</>
				) : (
					<Card>
					<Empty
						icon={MdAssignment}
						title="No Assignments"
							description="There are no assignments in this class yet. Create assignments to start grading."
						/>
					</Card>
				)}
			</div>

			{/* Markschemes Section */}
			<Card className="flex flex-col space-y-4 p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-foreground-primary">Markschemes</h2>
					<Button.Light onClick={handleCreateMarkscheme} className="flex items-center gap-2">
						<MdAdd className="w-4 h-4" />
						Create Markscheme
					</Button.Light>
				</div>

				{markschemes.length > 0 ? (
					<div className="grid gap-4">
						{markschemes.map((markscheme, index) => {
							let markschemeName = "Untitled Markscheme";
							try {
								const parsed = JSON.parse(markscheme.structured);
								markschemeName = parsed.name || "Untitled Markscheme";
							} catch (error) {
								console.error("Error parsing markscheme:", error);
							}

							return (
								<div
									key={markscheme.id}
									className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
								>
									<div className="flex flex-row items-center space-x-4">
										<MdChecklist className="w-5 h-5 text-primary-500" />
										<span 
											className="font-medium text-foreground cursor-pointer hover:text-primary-500 transition-colors"
											onClick={() => handlePreviewMarkscheme(markscheme)}
										>
											{markschemeName}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Button.SM
											size="sm"
											onClick={() => handleEditMarkscheme(markscheme)}
										>
											<MdEdit className="w-4 h-4" />
										</Button.SM>
										<Button.SM
											size="sm"
											onClick={() => handleDeleteMarkscheme(markscheme.id)}
											disabled={deleteMarkscheme.isPending}
										>
											<MdDelete className="w-4 h-4" />
										</Button.SM>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<Empty
						icon={HiClipboardCheck}
						title="No Markschemes"
						description="There are no markschemes created yet. Create markschemes to define grading criteria for assignments."
					/>
				)}
			</Card>

			{/* Grading Boundaries Section */}
			<Card className="flex flex-col space-y-4 p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-foreground-primary">Grading Boundaries</h2>
					<Button.Light onClick={handleCreateGradingBoundary} className="flex items-center gap-2">
						<MdAdd className="w-4 h-4" />
						Create Grading Boundary
					</Button.Light>
				</div>

				{gradingBoundaries.length > 0 ? (
					<div className="grid gap-4">
						{gradingBoundaries.map((gradingBoundary, index) => {
							let gradingBoundaryName = "Untitled Grading Boundary";
							try {
								const parsed = JSON.parse(gradingBoundary.structured);
								gradingBoundaryName = parsed.name || "Untitled Grading Boundary";
							} catch (error) {
								console.error("Error parsing grading boundary:", error);
							}

							return (
								<div
									key={gradingBoundary.id}
									className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
								>
									<div className="flex flex-row items-center space-x-4">
										<HiClipboardList className="w-5 h-5 text-primary-500" />
										<span 
											className="font-medium text-foreground cursor-pointer hover:text-primary-500 transition-colors"
											onClick={() => handlePreviewGradingBoundary(gradingBoundary)}
										>
											{gradingBoundaryName}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Button.SM
											size="sm"
											onClick={() => handleEditGradingBoundary(gradingBoundary)}
										>
											<MdEdit className="w-4 h-4" />
										</Button.SM>
										<Button.SM
											size="sm"
											onClick={() => handleDeleteGradingBoundary(gradingBoundary.id)}
											disabled={deleteGradingBoundary.isPending}
										>
											<MdDelete className="w-4 h-4" />
										</Button.SM>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<Empty
						icon={HiClipboardList}
						title="No Grading Boundaries"
						description="There are no grading boundaries created yet. Create grading boundaries to define grade ranges for assignments."
					/>
				)}
			</Card>

			{/* Students Section */}
			<Card className="flex flex-col space-y-4 p-6">
				<h2 className="text-base font-semibold text-foreground-primary">Students</h2>

				{students.length > 0 ? (
					<div className="grid gap-4">
						{students.map((student, index) => (
							<div
								key={index}
								className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
							>
								<div className="flex flex-row items-center space-x-4">
									<ProfilePicture username={student.username} size="md" />
									<span className="font-medium text-foreground">{student.username}</span>
								</div>
								<a
									href={`/classes/${params.classId}/grades/${student.id}`}
									className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
								>
									View Grades
								</a>
							</div>
						))}
					</div>
				) : (
					<Empty
						icon={MdPeople}
						title="No Students"
						description="There are no students enrolled in this class yet. Add students to view their grades."
					/>
				)}
			</Card>



			{/* Preview Sections */}
			{previewMarkscheme && (
				<Card className="flex flex-col space-y-4 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<HiClipboardCheck className="w-5 h-5 text-primary-500" />
							<h3 className="text-lg font-semibold text-foreground-primary">Rubric Preview</h3>
						</div>
						<Button.Light onClick={closePreview} size="sm">
							Close Preview
						</Button.Light>
					</div>
					<Rubric
						criteria={rubricCriteria}
						onChange={setRubricCriteria}
						readonly={true}
					/>
				</Card>
			)}

			{previewGradingBoundary && (
				<Card className="flex flex-col space-y-4 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<HiClipboardList className="w-5 h-5 text-primary-500" />
							<h3 className="text-lg font-semibold text-foreground-primary">Grading Boundaries Preview</h3>
						</div>
						<Button.Light onClick={closePreview} size="sm">
							Close Preview
						</Button.Light>
					</div>
					<GradingBoundaries
						boundaries={gradeBoundaries}
						onChange={setGradeBoundaries}
						readonly={true}
					/>
				</Card>
			)}
		</div >
	);
}