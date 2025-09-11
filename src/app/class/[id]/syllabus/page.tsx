"use client";

import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  Edit, 
  FileText,
  Eye,
  Download
} from "lucide-react";

const mockSyllabus = {
  courseTitle: "Advanced Physics",
  courseCode: "PHYS-101",
  instructor: "Dr. John Smith",
  semester: "Spring 2024",
  credits: 3,
  description: "This course provides an in-depth study of advanced physics concepts including thermodynamics, electromagnetism, and modern physics theories. Students will engage in both theoretical analysis and practical laboratory work.",
  objectives: [
    "Understand fundamental principles of thermodynamics and their applications",
    "Analyze electromagnetic phenomena and wave properties", 
    "Explore concepts in modern physics including quantum mechanics",
    "Develop problem-solving skills through practical applications",
    "Conduct laboratory experiments and interpret scientific data"
  ],
  schedule: [
    { week: 1, topic: "Introduction to Thermodynamics", readings: "Chapter 1-2" },
    { week: 2, topic: "Laws of Thermodynamics", readings: "Chapter 3-4" },
    { week: 3, topic: "Heat Engines and Refrigerators", readings: "Chapter 5" },
    { week: 4, topic: "Electromagnetic Fields", readings: "Chapter 6-7" },
    { week: 5, topic: "Electromagnetic Waves", readings: "Chapter 8" },
    { week: 6, topic: "Optics and Wave Properties", readings: "Chapter 9-10" },
    { week: 7, topic: "Midterm Exam", readings: "Review Chapters 1-10" },
    { week: 8, topic: "Introduction to Quantum Mechanics", readings: "Chapter 11" }
  ],
  grading: [
    { component: "Midterm Exam", percentage: 25 },
    { component: "Final Exam", percentage: 35 },
    { component: "Laboratory Reports", percentage: 20 },
    { component: "Assignments", percentage: 15 },
    { component: "Participation", percentage: 5 }
  ],
  policies: "Late assignments will be penalized 10% per day. Make-up exams are only available with prior approval and valid documentation. All laboratory safety protocols must be followed.",
  resources: [
    "Physics: Principles with Applications by Douglas Giancoli",
    "University Physics with Modern Physics by Young & Freedman",
    "Online physics simulations and interactive tools",
    "Laboratory equipment and safety guidelines"
  ]
};

export default function Syllabus() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    // In a real app, this would load the current syllabus content for editing
    setEditedContent(JSON.stringify(mockSyllabus, null, 2));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save the edited content
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Course Syllabus</h1>
          <p className="text-muted-foreground">Course information, schedule, and policies</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Syllabus
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Syllabus</CardTitle>
            <p className="text-sm text-muted-foreground">
              Modify the course syllabus content below
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
              placeholder="Enter syllabus content..."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Course Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{mockSyllabus.courseTitle}</CardTitle>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span>{mockSyllabus.courseCode}</span>
                <span>•</span>
                <span>{mockSyllabus.semester}</span>
                <span>•</span>
                <span>{mockSyllabus.credits} Credits</span>
              </div>
              <p className="text-sm">Instructor: {mockSyllabus.instructor}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Course Description</h4>
                  <p className="text-muted-foreground">{mockSyllabus.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockSyllabus.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Course Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Course Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Week</th>
                      <th className="text-left p-3 font-medium">Topic</th>
                      <th className="text-left p-3 font-medium">Readings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSyllabus.schedule.map((item) => (
                      <tr key={item.week} className="border-b">
                        <td className="p-3 font-medium">{item.week}</td>
                        <td className="p-3">{item.topic}</td>
                        <td className="p-3 text-muted-foreground">{item.readings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Grading Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Grading Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSyllabus.grading.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="font-medium">{item.component}</span>
                    <span className="text-lg font-bold">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Course Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{mockSyllabus.policies}</p>
            </CardContent>
          </Card>

          {/* Required Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Required Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockSyllabus.resources.map((resource, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{resource}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}