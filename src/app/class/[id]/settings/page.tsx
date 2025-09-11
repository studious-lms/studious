"use client";

import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ColorPicker from "@/components/ui/color-picker";
import { 
  Save, 
  Trash2
} from "lucide-react";

export default function ClassSettings() {
  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Class Settings</h1>
          <p className="text-muted-foreground">Configure class details and preferences</p>
        </div>
        
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className" className="text-sm">Class Name</Label>
                <Input id="className" defaultValue="Advanced Physics" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section" className="text-sm">Section</Label>
                <Input id="section" defaultValue="AP-101" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">Subject</Label>
                <Input id="subject" defaultValue="Physics" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-sm">Semester</Label>
                <Input id="semester" defaultValue="Spring 2024" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits" className="text-sm">Credits</Label>
                <Input id="credits" defaultValue="3" type="number" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingTime" className="text-sm">Meeting Time</Label>
                <Input id="meetingTime" defaultValue="MWF 10:00-11:00 AM" className="text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Input id="description" defaultValue="Advanced topics in modern physics" className="text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <ColorPicker
              value="#3b82f6"
              onChange={(color) => console.log('Selected color:', color)}
              label=""
              description="Choose a theme color for this class"
            />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Class
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}