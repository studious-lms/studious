"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/ui/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraggableAssignment } from "@/components/DraggableAssignment";
import { trpc } from "@/lib/trpc";
import { AILabModal } from "@/components/modals";
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  FileText, 
  Brain, 
  ClipboardList, 
  GraduationCap, 
  Target, 
  Zap,
  MessageSquare,
  Eye,
  Clock,
  Trash2,
  PenTool
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";



export default function ClassAILabs() {
  const t = useTranslations('aiLabs');
  const tCommon = useTranslations('common');
  const { id: classId } = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const isStudent = appState.user.student;
  
  const [selectedLabType, setSelectedLabType] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'drafts' | 'chats'>('drafts');

  // Fetch lab chats from backend
  const { data: labChats, isLoading: isLoadingLabChats, refetch: refetchLabChats } = trpc.labChat.list.useQuery({
    classId: classId as string
  });

  // Fetch class data to get assignments
  const { data: classData, isLoading: isLoadingClass } = trpc.class.get.useQuery({
    classId: classId as string
  });

  // Create lab chat mutation
  const createLabChatMutation = trpc.labChat.create.useMutation({
    onSuccess: (newLabChat) => {
      toast.success(t('toast.labCreated'));
      setShowModal(false);
      setSelectedLabType(null);
      refetchLabChats();
      // Navigate to the new lab chat
      router.push(`/class/${classId}/ai-labs/chats/${newLabChat.id}`);
    },
    onError: (error) => {
      toast.error(t('toast.labCreateFailed') + error.message);
    }
  });

  // Delete lab chat mutation
  const deleteLabChatMutation = trpc.labChat.delete.useMutation({
    onSuccess: () => {
      toast.success(t('toast.labDeleted'));
      refetchLabChats();
    },
    onError: (error) => {
      toast.error(t('toast.labDeleteFailed') + error.message);
    }
  });

  // Sort chats by most recent first
  const sortedChats = labChats?.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ) || [];

  // Filter assignments that are inProgress (lab drafts) and sort by most recent
  const assignments = classData?.class?.assignments || [];
  const labDrafts = assignments.filter(assignment => assignment.inProgress);
  const sortedDrafts = labDrafts.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCreateLabChat = (data: { title: string; context: any }) => {
    createLabChatMutation.mutate({
      classId: classId as string,
      title: data.title,
      context: JSON.stringify(data.context)
    });
  };

  const handleDeleteLabChat = (labChatId: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteLabChatMutation.mutate({ labChatId });
    }
  };

  const handleLabChatClick = (labChatId: string) => {
    router.push(`/class/${classId}/ai-labs/chats/${labChatId}`);
  };


  const creationWidgets = [
    {
      id: "assignment",
      title: t('widgets.assignment.title'),
      description: t('widgets.assignment.description'),
      icon: FileText,
      color: "#4E81EE" // Blue
    },
    {
      id: "quiz", 
      title: t('widgets.quiz.title'),
      description: t('widgets.quiz.description'),
      icon: Brain,
      color: "#FE7F7F" // Red
    },
    {
      id: "worksheet",
      title: t('widgets.worksheet.title'),
      description: t('widgets.worksheet.description'),
      icon: ClipboardList,
      color: "#FFB500" // Yellow
    },
    {
      id: "lesson-plan",
      title: t('widgets.lessonPlan.title'),
      description: t('widgets.lessonPlan.description'),
      icon: GraduationCap,
      color: "#96C84D" // Green
    },
    {
      id: "rubric",
      title: t('widgets.rubric.title'),
      description: t('widgets.rubric.description'),
      icon: Target,
      color: "#A855F7" // Purple
    }
  ];

  const handleWidgetClick = (widgetId: string) => {
    const widget = creationWidgets.find(w => w.id === widgetId);
    if (widget) {
      setSelectedLabType(widget.title);
      setShowModal(true);
    }
  };

  const handleDeleteLab = (labId: string) => {
    console.log("Delete lab:", labId);
    // Handle lab deletion
  };

  const handlePublishLab = (labId: string) => {
    console.log("Publish lab:", labId);
    // Handle lab publishing
  };


  // Calculate stats
  const totalDrafts = sortedDrafts.length;
  const totalChats = sortedChats.length;
  const totalMessages = sortedChats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('subtitle')}
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('aiPowered')}
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('stats.drafts')}
              value={totalDrafts}
              icon={PenTool}
              description={t('stats.draftsDesc')}
              color="#4E81EE"
            />
            <StatsCard
              title={t('stats.chats')}
              value={totalChats}
              icon={MessageSquare}
              description={t('stats.chatsDesc')}
              color="#A855F7"
            />
            <StatsCard
              title={t('stats.messages')}
              value={totalMessages}
              icon={Brain}
              description={t('stats.messagesDesc')}
              color="#96C84D"
            />
            <StatsCard
              title={t('stats.generated')}
              value={totalDrafts + totalChats}
              icon={Sparkles}
              description={t('stats.generatedDesc')}
              color="#FFB500"
            />
          </div>

          {/* Creation Widgets - Only show for teachers */}
          {!isStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{t('createNew')}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pt-4">
                {creationWidgets.map((widget) => {
                  const IconComponent = widget.icon;
                  return (
                    <button 
                      key={widget.id}
                      className="relative p-5 rounded-xl border text-left transition-all duration-200 group hover:shadow-lg"
                      style={{ 
                        backgroundColor: `${widget.color}10`,
                        borderColor: `${widget.color}30`
                      }}
                      onClick={() => handleWidgetClick(widget.id)}
                    >
                      {/* Icon badge - top right */}
                      <div 
                        className="absolute -top-3 -right-3 p-2.5 rounded-full shadow-md group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: widget.color }}
                      >
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="pr-6">
                        <h3 className="font-semibold text-foreground">{widget.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {widget.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                          <Zap className="h-3 w-3" />
                          {t('aiGenerated')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'drafts' | 'chats')}>
            <TabsList>
              <TabsTrigger value="drafts">{t('tabs.drafts')}</TabsTrigger>
              <TabsTrigger value="chats">{t('tabs.chats')}</TabsTrigger>
            </TabsList>

            {/* Draft Labs Tab */}
            <TabsContent value="drafts" className="space-y-6">
              {isLoadingClass ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="flex gap-2">
                              <div className="h-3 bg-muted rounded w-16" />
                              <div className="h-3 bg-muted rounded w-20" />
                            </div>
                            <div className="h-3 bg-muted rounded w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sortedDrafts.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title={t('drafts.empty.title')}
                  description={t('drafts.empty.description')}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('drafts.title', { count: sortedDrafts.length })}</h3>
                  </div>
                  <div className="space-y-4">
                    {sortedDrafts.map((assignment, index) => (
                      <DraggableAssignment
                        key={assignment.id}
                        assignment={assignment}
                        classId={classId as string}
                        index={index}
                        onDelete={handleDeleteLab}
                        onPublish={handlePublishLab}
                        isTeacher={!isStudent}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* AI Chats Tab */}
            <TabsContent value="chats" className="space-y-6">
              {isLoadingLabChats ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="flex gap-2">
                              <div className="h-3 bg-muted rounded w-16" />
                              <div className="h-3 bg-muted rounded w-20" />
                            </div>
                            <div className="h-3 bg-muted rounded w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sortedChats.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title={t('chats.empty.title')}
                  description={t('chats.empty.description')}
                />
              ) : (
                <div className="space-y-6">
                  {/* All Lab Chats */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{t('chats.title', { count: sortedChats.length })}</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Brain className="h-3 w-3 mr-1" />
                        {t('chats.active')}
                      </Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {sortedChats.map((labChat) => {
                        return (
                          <Card 
                            key={labChat.id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                            style={{ 
                              backgroundColor: '#A855F715',
                              borderColor: '#A855F730'
                            }}
                            onClick={() => handleLabChatClick(labChat.id)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div 
                                  className="p-2.5 rounded-xl group-hover:scale-105 transition-transform"
                                  style={{ backgroundColor: '#A855F725' }}
                                >
                                  <Brain className="h-5 w-5" style={{ color: '#A855F7' }} />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLabChatClick(labChat.id);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {!isStudent && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLabChat(labChat.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <h4 className="font-semibold text-base mb-2 line-clamp-1">{labChat.title}</h4>
                              
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {labChat.messageCount || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(labChat.updatedAt), { addSuffix: true })}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Users className="h-3 w-3" />
                                {labChat.createdBy.profile?.displayName || labChat.createdBy.username}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
    </div>

        {/* AI Lab Modal */}
        <AILabModal
          open={showModal}
          onOpenChange={setShowModal}
          labType={selectedLabType || "assignment"}
          classId={classId as string}
          onSubmit={handleCreateLabChat}
          isLoading={createLabChatMutation.isPending}
        />
      </PageLayout>
    </DndProvider>
  );
}