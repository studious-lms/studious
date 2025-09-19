"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2, Edit } from "lucide-react";
import { type RubricCriteria } from "@/lib/types/rubric";

export interface RubricLevel {
	id: string;
	name: string;
	description: string;
	points: number;
	color?: string;
}

export interface RubricProps {
	criteria: RubricCriteria[];
	onChange: (criteria: RubricCriteria[]) => void;
}

export function Rubric({ criteria, onChange }: RubricProps) {
	const [editingCriteria, setEditingCriteria] = useState<string | null>(null);
	const [newLevelName, setNewLevelName] = useState("");
	const [newLevelDescription, setNewLevelDescription] = useState("");
	const [newLevelPoints, setNewLevelPoints] = useState(0);

	const addCriteria = () => {
		const newCriteria: RubricCriteria = {
			id: Date.now().toString(),
			title: "",
			description: "",
			levels: [
				{
					id: "excellent",
					name: "Excellent",
					description: "Outstanding performance",
					points: 4,
					color: "#4CAF50"
				},
				{
					id: "good",
					name: "Good",
					description: "Good performance",
					points: 3,
					color: "#8BC34A"
				},
				{
					id: "satisfactory",
					name: "Satisfactory",
					description: "Adequate performance",
					points: 2,
					color: "#FFEB3B"
				},
				{
					id: "needs-improvement",
					name: "Needs Improvement",
					description: "Below expectations",
					points: 1,
					color: "#FF9800"
				}
			]
		};
		onChange([...criteria, newCriteria]);
		setEditingCriteria(newCriteria.id);
	};

	const updateCriteria = (id: string, updates: Partial<RubricCriteria>) => {
		onChange(criteria.map(item => 
			item.id === id ? { ...item, ...updates } : item
		));
	};

	const deleteCriteria = (id: string) => {
		onChange(criteria.filter(item => item.id !== id));
		setEditingCriteria(null);
	};

	const updateLevel = (criteriaId: string, levelId: string, updates: Partial<RubricLevel>) => {
		onChange(criteria.map(criterion => {
			if (criterion.id === criteriaId) {
				return {
					...criterion,
					levels: criterion.levels.map(level => 
						level.id === levelId ? { ...level, ...updates } : level
					)
				};
			}
			return criterion;
		}));
	};

	const addLevel = (criteriaId: string) => {
		if (!newLevelName.trim()) return;
		
		const newLevel: RubricLevel = {
			id: Date.now().toString(),
			name: newLevelName.trim(),
			description: newLevelDescription.trim(),
			points: newLevelPoints,
			color: "#9E9E9E"
		};

		updateCriteria(criteriaId, {
			levels: [...criteria.find(c => c.id === criteriaId)!.levels, newLevel]
		} as RubricCriteria);
		
		setNewLevelName("");
		setNewLevelDescription("");
		setNewLevelPoints(0);
	};

	const deleteLevel = (criteriaId: string, levelId: string) => {
		const criterion = criteria.find(c => c.id === criteriaId);
		if (!criterion || criterion.levels.length <= 1) return;
		
		updateCriteria(criteriaId, {
			levels: criterion.levels.filter(level => level.id !== levelId)
		});
	};

	const totalPoints = criteria.reduce((sum, criterion) => {
		const maxPoints = Math.max(...criterion.levels.map(level => level.points as number));
		return sum + maxPoints;
	}, 0);


	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-lg font-semibold text-foreground">Rubric</h3>
					<p className="text-sm text-muted-foreground">Total Points: {totalPoints}</p>
				</div>
				<Button variant="outline" onClick={addCriteria} className="flex items-center gap-2">
					<Plus className="w-4 h-4" />
					Add Criteria
				</Button>
			</div>

			{criteria.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No rubric criteria defined yet.</p>
					<p className="text-sm mt-2">Click "Add Criteria" to start creating your rubric.</p>
				</div>
			) : (
				<div className="space-y-6">
					{criteria.map((criterion, index) => (
						<div key={criterion.id} className="border border-border rounded-lg p-4">
							{editingCriteria === criterion.id ? (
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-foreground">Criteria Title</label>
											<Input
												placeholder="e.g., Content Quality"
												value={criterion.title}
												onChange={(e) => updateCriteria(criterion.id, { title: e.target.value })}
											/>
										</div>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">Description</label>
										<Textarea
											placeholder="Describe what this criteria evaluates..."
											value={criterion.description}
											onChange={(e) => updateCriteria(criterion.id, { description: e.target.value })}
										/>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<label className="text-sm font-medium text-foreground">Achievement Levels</label>
											<Button size="sm" onClick={() => addLevel(criterion.id)}>
												<Plus className="w-4 h-4" />
											</Button>
										</div>
										
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {criterion.levels.map((level) => (
                                          <div key={level.id} className="border border-border rounded p-3">
													<div className="flex items-center justify-between mb-2">
														<span className="font-medium text-sm">{level.name}</span>
														{criterion.levels.length > 1 && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => deleteLevel(criterion.id, level.id)}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
													</div>
													<div className="space-y-2">
														<div>
															<label className="text-xs font-medium text-muted-foreground">Name</label>
															<Input
																value={level.name}
																onChange={(e) => updateLevel(criterion.id, level.id, { name: e.target.value })}
															/>
														</div>
														<div>
															<label className="text-xs font-medium text-muted-foreground">Points</label>
															<Input
																type="number"
																value={level.points}
																onChange={(e) => updateLevel(criterion.id, level.id, { points: parseInt(e.target.value) || 0 })}
															/>
														</div>
														<div>
															<label className="text-xs font-medium text-muted-foreground">Description</label>
															<Textarea
																value={level.description}
																onChange={(e) => updateLevel(criterion.id, level.id, { description: e.target.value })}
															/>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>

									<div className="flex gap-2">
										<Button onClick={() => setEditingCriteria(null)}>
											Done
										</Button>
										<Button variant="outline" onClick={() => deleteCriteria(criterion.id)}>
											Delete Criteria
										</Button>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-muted-foreground">
												{index + 1}.
											</span>
											<h4 className="font-medium text-foreground">
												{criterion.title || "Untitled Criteria"}
											</h4>
											<span className="text-sm text-muted-foreground">
												({Math.max(...criterion.levels.map(l => l.points))} points)
											</span>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setEditingCriteria(criterion.id)}
										>
											<Edit className="w-4 h-4" />
										</Button>
									</div>
									
									{criterion.description && (
										<p className="text-sm text-muted-foreground ml-6">
											{criterion.description}
										</p>
									)}
									
									<div className="ml-6">
										<div className="flex flex-col gap-3">
											{criterion.levels.map((level) => (
												<Card key={level.id} className="border border-border rounded p-2">
													<div className="font-medium text-sm text-foreground">
														{level.name} ({level.points} pts)
													</div>
													<div className="text-xs text-muted-foreground mt-1">
														{level.description}
													</div>
												</Card>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
