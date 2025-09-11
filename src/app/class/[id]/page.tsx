"use client";

import { useParams } from "next/navigation";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  FileText, 
  BarChart3,
  Plus,
  Bell
} from "lucide-react";
import { CreateAnnouncementModal } from "@/components/modals";

export default function ClassOverview() {
  // const params = useParams();
  // const classId = params.id as string;

  // Mock data
  const classData = {
    title: "Advanced Physics",
    section: "AP-101", 
    subject: "Physics",
    students: 24,
    assignments: 8,
    averageGrade: 87,
    announcements: [
      { id: "1", title: "Lab report due Friday", date: "2 days ago", urgent: true },
      { id: "2", title: "Quiz next week on Chapter 8", date: "1 week ago", urgent: false }
    ],
    recentActivity: [
      { type: "assignment", title: "Lab Report #3 submitted", student: "Alex Johnson", time: "2 hours ago" },
      { type: "grade", title: "Quiz #5 graded", average: 85, time: "1 day ago" },
      { type: "attendance", title: "Attendance recorded", present: 22, total: 24, time: "2 days ago" }
    ]
  };

  return (
    <PageLayout>
      <PageHeader
        title={classData.title}
        description={`${classData.section} • ${classData.subject}`}
      >
        <div className="flex items-center space-x-2">
          <CreateAnnouncementModal>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Post Announcement
            </Button>
          </CreateAnnouncementModal>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.students}</div>
            <p className="text-xs text-muted-foreground">Enrolled this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.assignments}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Teaching Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Teaching Announcements
              <CreateAnnouncementModal>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </CreateAnnouncementModal>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classData.announcements.map((announcement) => (
              <div key={announcement.id} className="flex items-start justify-between p-3 rounded-lg bg-muted">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{announcement.title}</p>
                    {announcement.urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {announcement.date}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Post announcements to communicate with your students
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  {activity.type === "assignment" && (
                    <p className="text-xs text-muted-foreground">by {activity.student}</p>
                  )}
                  {activity.type === "grade" && (
                    <p className="text-xs text-muted-foreground">Average: {activity.average}%</p>
                  )}
                  {activity.type === "attendance" && (
                    <p className="text-xs text-muted-foreground">{activity.present}/{activity.total} present</p>
                  )}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}