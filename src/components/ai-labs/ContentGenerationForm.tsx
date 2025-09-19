// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Progress } from "@/components/ui/progress";
// import { 
//   FileText, 
//   Presentation, 
//   ClipboardList, 
//   GraduationCap,
//   Upload,
//   X,
//   Download,
//   Eye,
//   Settings,
//   Plus,
//   Minus,
//   ChevronRight,
//   ChevronLeft,
//   Sparkles,
//   Wand2,
//   CheckCircle,
//   AlertCircle,
//   Lightbulb,
//   Zap
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useToast } from "@/hooks/use-toast";

// interface ContentType {
//   id: string;
//   title: string;
//   description: string;
//   icon: any;
//   color: string;
//   fields: FormField[];
// }

// interface FormField {
//   id: string;
//   label: string;
//   type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'file';
//   required?: boolean;
//   placeholder?: string;
//   options?: string[];
//   description?: string;
// }

// const contentTypes: ContentType[] = [
//   {
//     id: 'worksheet',
//     title: 'Student Worksheet',
//     description: 'Generate structured worksheets and practice materials',
//     icon: FileText,
//     color: 'bg-blue-500',
//     fields: [
//       { id: 'title', label: 'Worksheet Title', type: 'text', required: true, placeholder: 'e.g., Algebra Practice Problems' },
//       { id: 'subject', label: 'Subject Area', type: 'select', required: true, options: ['Mathematics', 'Science', 'English', 'History', 'Other'] },
//       { id: 'grade_level', label: 'Grade Level', type: 'select', required: true, options: ['Elementary', 'Middle School', 'High School', 'College'] },
//       { id: 'learning_objectives', label: 'Learning Objectives', type: 'textarea', required: true, placeholder: 'What should students learn from this worksheet?', description: 'List 2-3 specific learning goals' },
//       { id: 'topic', label: 'Specific Topic/Chapter', type: 'text', required: true, placeholder: 'e.g., Quadratic Equations' },
//       { id: 'difficulty', label: 'Difficulty Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
//       { id: 'num_questions', label: 'Number of Questions', type: 'number', required: true, placeholder: '10' },
//       { id: 'question_types', label: 'Question Types', type: 'checkbox', options: ['Multiple Choice', 'Short Answer', 'Problem Solving', 'Essay Questions'] },
//       { id: 'additional_notes', label: 'Additional Requirements', type: 'textarea', placeholder: 'Any specific instructions or requirements...' }
//     ]
//   },
//   {
//     id: 'presentation',
//     title: 'Teaching Presentation',
//     description: 'Create structured lesson presentations and slides',
//     icon: Presentation,
//     color: 'bg-purple-500',
//     fields: [
//       { id: 'title', label: 'Presentation Title', type: 'text', required: true, placeholder: 'e.g., Introduction to Photosynthesis' },
//       { id: 'subject', label: 'Subject Area', type: 'select', required: true, options: ['Mathematics', 'Science', 'English', 'History', 'Other'] },
//       { id: 'duration', label: 'Lesson Duration', type: 'select', required: true, options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes'] },
//       { id: 'audience', label: 'Target Audience', type: 'select', required: true, options: ['Elementary Students', 'Middle School Students', 'High School Students', 'College Students'] },
//       { id: 'learning_outcomes', label: 'Learning Outcomes', type: 'textarea', required: true, placeholder: 'What will students be able to do after this lesson?', description: 'List 3-5 measurable outcomes' },
//       { id: 'key_concepts', label: 'Key Concepts to Cover', type: 'textarea', required: true, placeholder: 'List the main concepts, terms, and ideas...' },
//       { id: 'num_slides', label: 'Approximate Number of Slides', type: 'number', required: true, placeholder: '15' },
//       { id: 'interactive_elements', label: 'Interactive Elements', type: 'checkbox', options: ['Discussion Questions', 'Activities', 'Quizzes', 'Group Work', 'Demonstrations'] },
//       { id: 'resources', label: 'Additional Resources Needed', type: 'textarea', placeholder: 'Videos, images, props, etc...' }
//     ]
//   },
//   {
//     id: 'assignment',
//     title: 'Assignment',
//     description: 'Design comprehensive assignments and assessments',
//     icon: ClipboardList,
//     color: 'bg-green-500',
//     fields: [
//       { id: 'title', label: 'Assignment Title', type: 'text', required: true, placeholder: 'e.g., Research Project on Climate Change' },
//       { id: 'type', label: 'Assignment Type', type: 'select', required: true, options: ['Essay', 'Research Project', 'Lab Report', 'Problem Set', 'Creative Project', 'Presentation'] },
//       { id: 'subject', label: 'Subject Area', type: 'select', required: true, options: ['Mathematics', 'Science', 'English', 'History', 'Other'] },
//       { id: 'grade_level', label: 'Grade Level', type: 'select', required: true, options: ['Elementary', 'Middle School', 'High School', 'College'] },
//       { id: 'objectives', label: 'Assignment Objectives', type: 'textarea', required: true, placeholder: 'What skills and knowledge will this assignment assess?', description: 'List 3-4 specific objectives' },
//       { id: 'instructions', label: 'Core Instructions', type: 'textarea', required: true, placeholder: 'Main task description and requirements...' },
//       { id: 'length', label: 'Expected Length/Duration', type: 'text', required: true, placeholder: 'e.g., 5 pages, 2 weeks, 10 problems' },
//       { id: 'resources', label: 'Required Resources', type: 'textarea', placeholder: 'Textbook chapters, websites, materials needed...' },
//       { id: 'rubric_criteria', label: 'Grading Criteria', type: 'checkbox', options: ['Content Knowledge', 'Critical Thinking', 'Organization', 'Grammar/Mechanics', 'Creativity', 'Research Quality'] },
//       { id: 'due_date_type', label: 'Due Date Structure', type: 'select', options: ['Single Due Date', 'Multiple Milestones', 'Flexible Deadline'] },
//       { id: 'additional_requirements', label: 'Additional Requirements', type: 'textarea', placeholder: 'Citations, format requirements, submission guidelines...' }
//     ]
//   },
//   {
//     id: 'curriculum',
//     title: 'Curriculum Unit',
//     description: 'Develop comprehensive curriculum units and lesson sequences',
//     icon: GraduationCap,
//     color: 'bg-orange-500',
//     fields: [
//       { id: 'unit_title', label: 'Unit Title', type: 'text', required: true, placeholder: 'e.g., World War II and Its Impact' },
//       { id: 'subject', label: 'Subject Area', type: 'select', required: true, options: ['Mathematics', 'Science', 'English', 'History', 'Other'] },
//       { id: 'duration', label: 'Unit Duration', type: 'select', required: true, options: ['1 week', '2 weeks', '3 weeks', '1 month', '6 weeks', '1 semester'] },
//       { id: 'grade_level', label: 'Grade Level', type: 'select', required: true, options: ['Elementary', 'Middle School', 'High School', 'College'] },
//       { id: 'unit_overview', label: 'Unit Overview', type: 'textarea', required: true, placeholder: 'Brief description of what this unit covers...', description: 'High-level summary of the unit' },
//       { id: 'standards', label: 'Educational Standards', type: 'textarea', required: true, placeholder: 'List relevant state/national standards this unit addresses...' },
//       { id: 'essential_questions', label: 'Essential Questions', type: 'textarea', required: true, placeholder: 'What are the big questions students will explore?', description: '3-5 overarching questions' },
//       { id: 'learning_goals', label: 'Unit Learning Goals', type: 'textarea', required: true, placeholder: 'What will students know and be able to do?', description: 'Specific, measurable goals' },
//       { id: 'num_lessons', label: 'Number of Lessons', type: 'number', required: true, placeholder: '8' },
//       { id: 'assessment_types', label: 'Assessment Methods', type: 'checkbox', options: ['Formative Assessments', 'Summative Test', 'Project', 'Portfolio', 'Presentation', 'Performance Task'] },
//       { id: 'materials_needed', label: 'Materials and Resources', type: 'textarea', placeholder: 'Textbooks, technology, supplies, field trips...' },
//       { id: 'differentiation', label: 'Differentiation Strategies', type: 'textarea', placeholder: 'How will you support diverse learners?' }
//     ]
//   }
// ];

// interface ContentGenerationFormProps {
//   classData?: {
//     name: string;
//     subject: string;
//     grade?: string;
//   };
// }

// type WizardStep = 'select' | 'configure' | 'preview' | 'generate' | 'complete';

// export function ContentGenerationForm({ classData }: ContentGenerationFormProps) {
//   const [currentStep, setCurrentStep] = useState<WizardStep>('select');
//   const [selectedType, setSelectedType] = useState<string>('');
//   const [formData, setFormData] = useState<Record<string, any>>({});
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedContent, setGeneratedContent] = useState<any>(null);
//   const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
//   const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});
//   const { toast } = useToast();

//   const currentType = contentTypes.find(type => type.id === selectedType);
  
//   // Calculate progress
//   const totalRequiredFields = currentType?.fields.filter(f => f.required).length || 0;
//   const completedRequiredFields = currentType?.fields.filter(f => f.required && formData[f.id]).length || 0;
//   const progress = totalRequiredFields > 0 ? (completedRequiredFields / totalRequiredFields) * 100 : 0;

//   // Auto-generate AI suggestions based on class context
//   useEffect(() => {
//     if (classData && selectedType) {
//       const suggestions: Record<string, string[]> = {};
      
//       if (selectedType === 'worksheet') {
//         suggestions.title = [
//           `${classData.subject} Practice Problems`,
//           `${classData.name} - Chapter Review`,
//           `${classData.subject} Skills Assessment`
//         ];
//         suggestions.topic = [
//           'Current lesson topic',
//           'Previous chapter review',
//           'Exam preparation'
//         ];
//       } else if (selectedType === 'presentation') {
//         suggestions.title = [
//           `Introduction to ${classData.subject}`,
//           `${classData.name} - Weekly Overview`,
//           `Advanced ${classData.subject} Concepts`
//         ];
//       }
      
//       setAiSuggestions(suggestions);
//     }
//   }, [classData, selectedType]);

//   const handleFieldChange = (fieldId: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [fieldId]: value
//     }));
    
//     if (value && value.toString().trim()) {
//       setCompletedFields(prev => new Set([...prev, fieldId]));
//     } else {
//       setCompletedFields(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(fieldId);
//         return newSet;
//       });
//     }
//   };

//   const handleNext = () => {
//     if (currentStep === 'select' && selectedType) {
//       setCurrentStep('configure');
//     } else if (currentStep === 'configure') {
//       setCurrentStep('preview');
//     } else if (currentStep === 'preview') {
//       handleGenerate();
//     }
//   };

//   const handleBack = () => {
//     if (currentStep === 'configure') {
//       setCurrentStep('select');
//     } else if (currentStep === 'preview') {
//       setCurrentStep('configure');
//     } else if (currentStep === 'complete') {
//       setCurrentStep('select');
//       setSelectedType('');
//       setFormData({});
//       setGeneratedContent(null);
//       setCompletedFields(new Set());
//     }
//   };

//   const handleGenerate = async () => {
//     if (!currentType) return;

//     // Validate required fields
//     const requiredFields = currentType.fields.filter(field => field.required);
//     const missingFields = requiredFields.filter(field => !formData[field.id]);

//     if (missingFields.length > 0) {
//       toast({
//         title: "Missing Required Fields",
//         description: `Please fill out: ${missingFields.map(f => f.label).join(', ')}`,
//         variant: "destructive"
//       });
//       setCurrentStep('configure');
//       return;
//     }

//     setCurrentStep('generate');
//     setIsGenerating(true);

//     // Simulate AI generation with steps
//     setTimeout(() => {
//       toast({
//         title: "Analyzing requirements...",
//         description: "Processing your specifications"
//       });
//     }, 500);

//     setTimeout(() => {
//       toast({
//         title: "Generating content...",
//         description: "Creating your educational material"
//       });
//     }, 1500);

//     setTimeout(() => {
//       setGeneratedContent({
//         type: currentType.title,
//         title: formData.title || formData.unit_title,
//         preview: `Generated ${currentType.title.toLowerCase()} for ${classData?.name || 'your class'}. This content includes all requested elements and follows educational best practices.`,
//         fullContent: "This would contain the full generated content...",
//         downloadUrl: "#",
//         suggestions: [
//           "Add more interactive elements",
//           "Include assessment rubric",
//           "Create companion materials"
//         ]
//       });
//       setIsGenerating(false);
//       setCurrentStep('complete');
//       toast({
//         title: "Content Generated Successfully!",
//         description: `Your ${currentType.title.toLowerCase()} is ready to use.`
//       });
//     }, 3000);
//   };

//   const renderField = (field: FormField) => {
//     const value = formData[field.id] || '';

//     switch (field.type) {
//       case 'text':
//         return (
//           <Input
//             placeholder={field.placeholder}
//             value={value}
//             onChange={(e) => handleFieldChange(field.id, e.target.value)}
//           />
//         );

//       case 'number':
//         return (
//           <Input
//             type="number"
//             placeholder={field.placeholder}
//             value={value}
//             onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || '')}
//           />
//         );

//       case 'textarea':
//         return (
//           <Textarea
//             placeholder={field.placeholder}
//             value={value}
//             onChange={(e) => handleFieldChange(field.id, e.target.value)}
//             rows={3}
//           />
//         );

//       case 'select':
//         return (
//           <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select an option..." />
//             </SelectTrigger>
//             <SelectContent>
//               {field.options?.map((option) => (
//                 <SelectItem key={option} value={option}>
//                   {option}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         );

//       case 'checkbox':
//         const selectedOptions = value || [];
//         return (
//           <div className="space-y-2">
//             {field.options?.map((option) => (
//               <div key={option} className="flex items-center space-x-2">
//                 <Checkbox
//                   id={`${field.id}-${option}`}
//                   checked={selectedOptions.includes(option)}
//                   onCheckedChange={(checked) => {
//                     if (checked) {
//                       handleFieldChange(field.id, [...selectedOptions, option]);
//                     } else {
//                       handleFieldChange(field.id, selectedOptions.filter((o: string) => o !== option));
//                     }
//                   }}
//                 />
//                 <Label htmlFor={`${field.id}-${option}`} className="text-sm">
//                   {option}
//                 </Label>
//               </div>
//             ))}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const getStepIcon = (step: WizardStep) => {
//     switch (step) {
//       case 'select': return FileText;
//       case 'configure': return Settings;
//       case 'preview': return Eye;
//       case 'generate': return Wand2;
//       case 'complete': return CheckCircle;
//     }
//   };

//   const steps = [
//     { id: 'select', label: 'Choose Type', description: 'Select what to create' },
//     { id: 'configure', label: 'Configure', description: 'Set up your content' },
//     { id: 'preview', label: 'Review', description: 'Preview your choices' },
//     { id: 'generate', label: 'Generate', description: 'AI creates your content' },
//     { id: 'complete', label: 'Complete', description: 'Download and use' }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Progress Steps */}
//       <Card>
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             {steps.map((step, index) => {
//               const StepIcon = getStepIcon(step.id as WizardStep);
//               const isActive = currentStep === step.id;
//               const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
//               return (
//                 <div key={step.id} className="flex items-center">
//                   <div className="flex flex-col items-center">
//                     <div className={cn(
//                       "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
//                       isActive ? "bg-primary text-primary-foreground border-primary" :
//                       isCompleted ? "bg-green-500 text-white border-green-500" :
//                       "bg-muted text-muted-foreground border-muted"
//                     )}>
//                       <StepIcon className="h-4 w-4" />
//                     </div>
//                     <div className="mt-2 text-center">
//                       <p className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
//                         {step.label}
//                       </p>
//                       <p className="text-xs text-muted-foreground">{step.description}</p>
//                     </div>
//                   </div>
//                   {index < steps.length - 1 && (
//                     <div className={cn(
//                       "flex-1 h-px mx-4 transition-all",
//                       isCompleted ? "bg-green-500" : "bg-muted"
//                     )} />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
          
//           {/* Progress Bar */}
//           {currentStep === 'configure' && currentType && (
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium">Configuration Progress</span>
//                 <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
//               </div>
//               <Progress value={progress} className="h-2" />
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Step Content */}
//       <Card>
//         <CardContent className="p-6">
//           {/* Step 1: Content Type Selection */}
//           {currentStep === 'select' && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h2 className="text-2xl font-bold mb-2">What would you like to create?</h2>
//                 <p className="text-muted-foreground">Choose the type of educational content you want to generate</p>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {contentTypes.map((type) => {
//                   const Icon = type.icon;
//                   const isSelected = selectedType === type.id;
                  
//                   return (
//                     <Card
//                       key={type.id}
//                       className={cn(
//                         "cursor-pointer transition-all hover:shadow-md",
//                         isSelected && "ring-2 ring-primary shadow-md"
//                       )}
//                       onClick={() => setSelectedType(type.id)}
//                     >
//                       <CardContent className="p-6">
//                         <div className="flex items-start gap-4">
//                           <div className={cn("p-3 rounded-lg text-white", type.color)}>
//                             <Icon className="h-6 w-6" />
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
//                             <p className="text-muted-foreground text-sm">{type.description}</p>
//                             {isSelected && (
//                               <div className="mt-3">
//                                 <Badge className="bg-primary/10 text-primary">Selected</Badge>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Step 2: Configuration */}
//           {currentStep === 'configure' && currentType && (
//             <div className="space-y-6">
//               <div className="flex items-center gap-3">
//                 <div className={cn("p-2 rounded-lg text-white", currentType.color)}>
//                   <currentType.icon className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold">{currentType.title} Configuration</h2>
//                   <p className="text-muted-foreground">{currentType.description}</p>
//                 </div>
//               </div>
              
//               <ScrollArea className="max-h-[500px] pr-4">
//                 <div className="space-y-6">
//                   {currentType.fields.map((field) => (
//                     <div key={field.id} className="space-y-3">
//                       <Label htmlFor={field.id} className="flex items-center gap-2 text-sm font-medium">
//                         {field.label}
//                         {field.required && <span className="text-red-500">*</span>}
//                         {completedFields.has(field.id) && (
//                           <CheckCircle className="h-4 w-4 text-green-500" />
//                         )}
//                       </Label>
                      
//                       {/* AI Suggestions */}
//                       {aiSuggestions[field.id] && (
//                         <div className="flex items-center gap-2 mb-2">
//                           <Lightbulb className="h-4 w-4 text-yellow-500" />
//                           <span className="text-xs text-muted-foreground">AI Suggestions:</span>
//                           <div className="flex flex-wrap gap-1">
//                             {aiSuggestions[field.id].map((suggestion, idx) => (
//                               <Button
//                                 key={idx}
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 px-2 text-xs"
//                                 onClick={() => handleFieldChange(field.id, suggestion)}
//                               >
//                                 {suggestion}
//                               </Button>
//                             ))}
//                           </div>
//                         </div>
//                       )}
                      
//                       {renderField(field)}
                      
//                       {field.description && (
//                         <p className="text-xs text-muted-foreground flex items-center gap-1">
//                           <AlertCircle className="h-3 w-3" />
//                           {field.description}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </div>
//           )}

//           {/* Step 3: Preview */}
//           {currentStep === 'preview' && currentType && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h2 className="text-2xl font-bold mb-2">Review Your Configuration</h2>
//                 <p className="text-muted-foreground">Make sure everything looks correct before generating</p>
//               </div>
              
//               <Card className="bg-muted/30">
//                 <CardContent className="p-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-2">
//                       <div className={cn("p-2 rounded-lg text-white", currentType.color)}>
//                         <currentType.icon className="h-4 w-4" />
//                       </div>
//                       <h3 className="font-semibold">{currentType.title}</h3>
//                     </div>
                    
//                     {currentType.fields.filter(f => formData[f.id]).map((field) => (
//                       <div key={field.id} className="border-l-2 border-primary/20 pl-4">
//                         <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
//                         <p className="text-sm">{
//                           Array.isArray(formData[field.id]) 
//                             ? formData[field.id].join(', ')
//                             : formData[field.id]
//                         }</p>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {/* Step 4: Generate */}
//           {currentStep === 'generate' && (
//             <div className="text-center space-y-6">
//               <div className="space-y-4">
//                 <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
//                   <Zap className="h-8 w-8 text-white animate-pulse" />
//                 </div>
//                 <h2 className="text-2xl font-bold">AI is Creating Your Content</h2>
//                 <p className="text-muted-foreground">This usually takes 30-60 seconds...</p>
//               </div>
              
//               <div className="space-y-2">
//                 <Progress value={66} className="h-2" />
//                 <p className="text-sm text-muted-foreground">Analyzing requirements and generating content...</p>
//               </div>
//             </div>
//           )}

//           {/* Step 5: Complete */}
//           {currentStep === 'complete' && generatedContent && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
//                   <CheckCircle className="h-8 w-8 text-white" />
//                 </div>
//                 <h2 className="text-2xl font-bold mb-2">Content Generated Successfully!</h2>
//                 <p className="text-muted-foreground">Your {currentType?.title.toLowerCase()} is ready to use</p>
//               </div>
              
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Badge variant="secondary">Generated</Badge>
//                     {generatedContent.title}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-muted-foreground mb-4">{generatedContent.preview}</p>
                  
//                   {generatedContent.suggestions && (
//                     <div className="mb-4">
//                       <p className="text-sm font-medium mb-2">AI Suggestions for improvement:</p>
//                       <div className="space-y-1">
//                         {generatedContent.suggestions.map((suggestion: string, idx: number) => (
//                           <div key={idx} className="flex items-center gap-2 text-sm">
//                             <Lightbulb className="h-3 w-3 text-yellow-500" />
//                             {suggestion}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="flex gap-2">
//                     <Button>
//                       <Eye className="h-4 w-4 mr-2" />
//                       Preview Full Content
//                     </Button>
//                     <Button variant="outline">
//                       <Download className="h-4 w-4 mr-2" />
//                       Download
//                     </Button>
//                     <Button variant="outline" onClick={() => handleBack()}>
//                       Create Another
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Navigation */}
//       <div className="flex items-center justify-between">
//         <Button
//           variant="outline"
//           onClick={handleBack}
//           disabled={currentStep === 'select' || currentStep === 'generate'}
//         >
//           <ChevronLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
        
//         <div className="text-sm text-muted-foreground">
//           {classData && (
//             <span>Creating for: <strong>{classData.name}</strong></span>
//           )}
//         </div>
        
//         <Button
//           onClick={handleNext}
//           disabled={
//             (currentStep === 'select' && !selectedType) ||
//             (currentStep === 'configure' && progress < 100) ||
//             currentStep === 'generate' ||
//             currentStep === 'complete'
//           }
//         >
//           {currentStep === 'preview' ? (
//             <>
//               <Sparkles className="h-4 w-4 mr-2" />
//               Generate Content
//             </>
//           ) : (
//             <>
//               Next
//               <ChevronRight className="h-4 w-4 ml-2" />
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }
