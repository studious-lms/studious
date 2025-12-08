"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  Search, 
  Copy, 
  MoreHorizontal,
  Mail,
  UserX,
  Shield,
  User, 
  RefreshCcw,
  MapPin,
  Globe,
  Users,
  GraduationCap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";

import { useParams, useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";

// Skeleton for the entire members page
const MembersPageSkeleton = () => (
  <PageLayout>
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>

      {/* Invite code skeleton */}
      <Skeleton className="h-20 w-full rounded-lg" />

      {/* Search skeleton */}
      <Skeleton className="h-10 w-96" />

      {/* Members list skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </PageLayout>
);

export default function Members() {
  const t = useTranslations('members');
  const { id: classId } = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    profile?: {
      displayName?: string | null;
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      profilePicture?: string | null;
    } | null;
    type: 'teacher' | 'student';
  } | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const appState = useSelector((state: RootState) => state.app);
  const user = appState.user;
  
  // Chat hook for creating conversations
  const { createConversation, refetchConversations } = useChat(user?.loggedIn ? user.id : "");

  // API hooks
  const { data: classData, isLoading, error, refetch } = trpc.class.get.useQuery({ classId: classId as string });
  const { data: inviteCodeData, isLoading: inviteCodeLoading, refetch: refetchInviteCode } = trpc.class.getInviteCode.useQuery({ classId: classId as string }, { enabled: !!user?.teacher });
  const changeRoleMutation = trpc.class.changeRole.useMutation();
  const removeMemberMutation = trpc.class.removeMember.useMutation();
  const regenerateInviteCodeMutation = trpc.class.createInviteCode.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.inviteRegenerated'));
      refetchInviteCode();
    },
    onError: () => {
      toast.error(t('errors.regenerateFailed'));
    }
  });

  // Process members data
  const members = useMemo(() => {
    if (!classData?.class) return { teachers: [], students: [] };

    return {
      teachers: classData.class.teachers.map((t: RouterOutputs["class"]["get"]['class']['teachers'][number]) => ({ 
        ...t, 
        type: 'teacher' as const 
      })),
      students: classData.class.students.map((s: RouterOutputs["class"]["get"]['class']['students'][number]) => ({ 
        ...s, 
        type: 'student' as const 
      })),
    };
  }, [classData]);

  // Filter members based on search and tab
  const filteredMembers = useMemo(() => {
    if (!members) return { teachers: [], students: [] };

    const filterMembers = (memberList: RouterOutputs["class"]["get"]['class']['students']| RouterOutputs["class"]["get"]['class']['teachers']) => {
      return memberList.filter(member => 
        member.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };

    return {
      teachers: filterMembers(members.teachers) as RouterOutputs["class"]["get"]['class']['teachers'] & { type: 'teacher' },
      students: filterMembers(members.students) as RouterOutputs["class"]["get"]['class']['students'] & { type: 'student' },
    };
  }, [members, searchQuery]);

  const inviteCode = inviteCodeData?.code || "Loading...";

  const copyInviteCode = () => {
    if (inviteCode && inviteCode !== "Loading...") {
      navigator.clipboard.writeText(inviteCode);
      toast.success(t('toasts.copied'));
    }
  };

  const handleRoleChange = async (userId: string, newType: 'teacher' | 'student') => {
    try {
      await changeRoleMutation.mutateAsync({
        classId: classId as string,
        userId,
        type: newType,
      });
      toast.success(t('toasts.roleChanged', { role: newType }));
      refetch();
    } catch {
      toast.error(t('errors.changeRoleFailed'));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({
        classId: classId as string,
        userId,
      });
      toast.success(t('toasts.memberRemoved'));
      refetch();
    } catch {
      toast.error(t('errors.removeFailed'));
    }
  };

  const regenerateInviteCode = async () => {
    await regenerateInviteCodeMutation.mutateAsync({
      classId: classId as string,
    });
    toast.success(t('toasts.inviteRegenerated'));
  };

  const handleMessage = async (userId: string) => {
    try {
      const newConversation = await createConversation('DM', [userId]);
      await refetchConversations();
      router.push(`/chat/${newConversation.id}`);
      toast.success('Conversation created');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create conversation';
      toast.error(errorMessage);
    }
  };

  const getRoleBadge = (type: string) => {
    switch (type) {
      case "teacher":
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0">{t('labels.teacher')}</Badge>;
      default:
        return <Badge variant="secondary">{t('labels.student')}</Badge>;
    }
  };

  // Show skeleton loading
  if (isLoading) {
    return <MembersPageSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">{t('errors.failedToLoad')}</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>{t('actions.tryAgain')}</Button>
        </div>
      </PageLayout>
    );
  }

  const totalMembers = members.teachers.length + members.students.length;

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('counts.totalMembers', { count: totalMembers })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title={t('stats.totalMembers')}
            value={totalMembers}
            icon={Users}
            color="#4E81EE"
          />
          <StatsCard
            title={t('stats.teachers')}
            value={members.teachers.length}
            icon={Shield}
            color="#9333EA"
          />
          <StatsCard
            title={t('stats.students')}
            value={members.students.length}
            icon={GraduationCap}
            color="#96C84D"
          />
        </div>

        {/* Invite Code Section */}
        {user?.teacher && (
          <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">{t('invite.title')}</p>
                <p className="text-xs text-muted-foreground">{t('invite.description')}</p>
              </div>
            </div>
            {inviteCodeLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg bg-background border font-mono text-sm">
                  {inviteCode}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyInviteCode}
                  disabled={inviteCode === "Loading..."}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={regenerateInviteCode}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Members Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>{t('tabs.students')}</span>
              <Badge variant="secondary" className="ml-1">
                {filteredMembers.students.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{t('tabs.teachers')}</span>
              <Badge variant="secondary" className="ml-1">
                {filteredMembers.teachers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            {filteredMembers.students.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {filteredMembers.students.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.profile?.profilePicture || ""} />
                        <AvatarFallback>
                          {student.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{student.profile?.displayName || student.username}</h4>
                          {student.id === appState.user?.id && (
                            <Badge variant="outline" className="text-xs">{t('labels.you')}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{student.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMessage(student.id)}
                        disabled={student.id === user?.id}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      {appState.user?.teacher && student.id !== appState.user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(student.id, 'teacher')}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {t('actions.makeTeacher')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRemoveMember(student.id)}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              {t('actions.removeFromClass')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={User}
                title={t('students.empty.title')}
                description={searchQuery ? t('students.empty.matchNone', { query: searchQuery }) : t('students.empty.noStudents')}
              />
            )}
          </TabsContent>

          <TabsContent value="teachers">
            {filteredMembers.teachers.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {filteredMembers.teachers.map((teacher) => (
                  <div 
                    key={teacher.id} 
                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.profile?.profilePicture || ""} />
                        <AvatarFallback>
                          {teacher.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{teacher.profile?.displayName || teacher.username}</h4>
                          {getRoleBadge(teacher.type)}
                          {teacher.id === appState.user?.id && (
                            <Badge variant="outline" className="text-xs">{t('labels.you')}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{teacher.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMessage(teacher.id)}
                        disabled={teacher.id === user?.id}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      {appState.user?.teacher && teacher.id !== appState.user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(teacher.id, 'student')}
                            >
                              <User className="mr-2 h-4 w-4" />
                              {t('actions.makeStudent')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRemoveMember(teacher.id)}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              {t('actions.removeAccess')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Shield}
                title={t('teachers.empty.title')}
                description={searchQuery ? t('teachers.empty.matchNone', { query: searchQuery }) : t('teachers.empty.noTeachers')}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('profile.title')}</DialogTitle>
              <DialogDescription>
                {t('profile.description')}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.profile?.profilePicture || ""} />
                    <AvatarFallback>
                      {selectedUser.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {selectedUser.profile?.displayName || selectedUser.username}
                      </h3>
                      {getRoleBadge(selectedUser.type)}
                    </div>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                </div>

                {selectedUser.profile?.bio && (
                  <>
                    <Separator />
                    <p className="text-sm">{selectedUser.profile.bio}</p>
                  </>
                )}

                {/* Profile Information */}
                {(selectedUser.profile?.location || selectedUser.profile?.website) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {selectedUser.profile?.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedUser.profile.location}</span>
                        </div>
                      )}
                      
                      {selectedUser.profile?.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={selectedUser.profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {selectedUser.profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
