import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Eye, EyeOff, CheckCircle, Flag, Trash2 } from 'lucide-react';
import { mockPosts } from '@/data/mockData';
import { postModerationService } from '@/utils/postModeration';
import { ModeratedPost } from '@/utils/postModeration';
import { toast } from '@/hooks/use-toast';

export const ModerationDashboard = () => {
  const [posts, setPosts] = useState<ModeratedPost[]>(mockPosts);
  const stats = postModerationService.getModerationStats(posts);

  const autoDeletedPosts = posts.filter(post => post.isAutoDeleted);

  const handlePostAction = (postId: string, action: 'approve' | 'hide' | 'flag') => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          switch (action) {
            case 'approve':
              return {
                ...post,
                isHidden: false,
                isBully: false,
                isReported: false,
                moderationAction: 'none'
              };
            case 'hide':
              return {
                ...post,
                isHidden: true
              };
            case 'flag':
              return {
                ...post,
                isReported: true,
                moderationAction: 'flag'
              };
            default:
              return post;
          }
        }
        return post;
      })
    );

    const actionText = action === 'approve' ? 'approved' : action === 'hide' ? 'hidden' : 'flagged';
    toast({
      title: `Post ${actionText}`,
      description: `The post has been ${actionText} successfully.`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (post: ModeratedPost) => {
    if (post.isHidden) return <EyeOff className="w-4 h-4 text-red-500" />;
    if (post.isReported) return <Flag className="w-4 h-4 text-yellow-500" />;
    if (post.moderationAction === 'flag') return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const hiddenPosts = posts.filter(post => post.isHidden);
  const bullyPosts = posts.filter(post => post.isBully);
  const reportedPosts = posts.filter(post => post.isReported);
  const flaggedPosts = posts.filter(post => post.moderationAction === 'flag');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Moderation Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hidden Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hiddenPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bully Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.bullyPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reportedPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto-Deleted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.autoDeletedPosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Tabs */}
      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flagged">Flagged ({flaggedPosts.length})</TabsTrigger>
          <TabsTrigger value="hidden">Hidden ({hiddenPosts.length})</TabsTrigger>
          <TabsTrigger value="bully">Bully ({bullyPosts.length})</TabsTrigger>
          <TabsTrigger value="reported">Reports ({reportedPosts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posts Flagged by AI</CardTitle>
              <CardDescription>Posts that need moderator review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flaggedPosts.map(post => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(post)}
                      <span className="font-medium">{post.author.name}</span>
                      <span className="text-muted-foreground">@{post.author.handle}</span>
                    </div>
                    <div className="flex gap-2">
                      {post.cyberbullyingResult?.categories.map(category => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm bg-muted p-3 rounded">{post.content}</p>

                  {post.cyberbullyingResult && (
                    <div className="flex items-center gap-4 text-sm">
                      <span>Severity:</span>
                      <Badge className={`${getSeverityColor(post.cyberbullyingResult.severity)} text-white`}>
                        {post.cyberbullyingResult.severity.toUpperCase()}
                      </Badge>
                      <span>Confidence: {Math.round(post.cyberbullyingResult.confidence * 100)}%</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePostAction(post.id, 'approve')}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePostAction(post.id, 'flag')}>
                      <Flag className="w-4 h-4 mr-1" />
                      Keep Flagged
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handlePostAction(post.id, 'hide')}>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Hide
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hidden Posts</CardTitle>
              <CardDescription>Posts that have been hidden from public view</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hiddenPosts.map(post => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{post.author.name}</span>
                    <span className="text-muted-foreground">@{post.author.handle}</span>
                  </div>
                  <p className="text-sm bg-muted p-3 rounded italic text-muted-foreground">
                    {post.content}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePostAction(post.id, 'approve')}>
                      <Eye className="w-4 h-4 mr-1" />
                      Unhide
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bully" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bullying Content</CardTitle>
              <CardDescription>Posts identified as containing bullying or harassment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bullyPosts.map(post => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                  <p className="text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    {post.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reported" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Posts that have been reported by users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportedPosts.map(post => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                  <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                    {post.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
