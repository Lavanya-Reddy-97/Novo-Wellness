
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Users, Plus, Heart, Reply, Clock } from "lucide-react";
import { db, auth } from "@/integrations/firebase";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";

import { useToast } from "@/hooks/use-toast";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";

type Post = {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  is_approved?: boolean;
};

type Reply = {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  is_anonymous: boolean;
  is_approved?: boolean;
};

const AnonymousForum = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", is_anonymous: true });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState({ content: "", is_anonymous: true });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { filterProfanity } = useProfanityFilter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(
        collection(db, "forum_posts"),
        where("is_approved", "==", true),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || "",
          content: d.content || "",
          is_anonymous: d.is_anonymous ?? true,
          user_id: d.user_id || "",
          created_at: d.created_at || "",
          is_approved: d.is_approved ?? true
        };
      });
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const q = query(
        collection(db, "forum_replies"),
        where("post_id", "==", postId),
        where("is_approved", "==", true),
        orderBy("created_at", "asc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          content: d.content || "",
          post_id: d.post_id || "",
          user_id: d.user_id || "",
          created_at: d.created_at || "",
          is_anonymous: d.is_anonymous ?? true,
          is_approved: d.is_approved ?? true
        };
      });
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredTitle = filterProfanity(newPost.title);
    const filteredContent = filterProfanity(newPost.content);
    
    if (!filteredTitle.trim() || !filteredContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields with appropriate content",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to create posts",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "forum_posts"), {
        title: filteredTitle,
        content: filteredContent,
        is_anonymous: newPost.is_anonymous,
        user_id: user.uid,
        created_at: new Date().toISOString()
      });

      toast({
        title: "Post submitted!",
        description: "Your post is awaiting moderation approval"
      });

      setNewPost({ title: "", content: "", is_anonymous: true });
      setShowCreateForm(false);

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredContent = filterProfanity(newReply.content);
    
    if (!filteredContent.trim() || !selectedPost) {
      toast({
        title: "Error",
        description: "Please enter appropriate content for your reply",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to reply",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "forum_replies"), {
        content: filteredContent,
        post_id: selectedPost.id,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        is_anonymous: newReply.is_anonymous,
        is_approved: false // or true, depending on your moderation logic
      });

      toast({
        title: "Reply submitted!",
        description: "Your reply is awaiting moderation approval"
      });

      setNewReply({ content: "", is_anonymous: true });
      fetchReplies(selectedPost.id);

    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to create reply",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openPost = (post: any) => {
    setSelectedPost(post);
    fetchReplies(post.id);
  };

  const closePost = () => {
    setSelectedPost(null);
    setReplies([]);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Community Forum
          </CardTitle>
          <CardDescription>
            Share your thoughts, ask questions, and support others in a safe space.
            All posts are reviewed before being published.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <MessageSquare className="h-4 w-4" />
              {posts.length} active discussions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">✅ Be Supportive</h4>
              <p className="text-green-800">Offer encouragement and understanding to your peers</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">✅ Stay Anonymous</h4>
              <p className="text-blue-800">Protect your privacy and respect others' anonymity</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-1">⚠️ No Personal Info</h4>
              <p className="text-yellow-800">Don't share names, schools, or identifying details</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-1">❌ No Harmful Content</h4>
              <p className="text-red-800">Bullying, harassment, or harmful advice is not allowed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
            <CardDescription>
              Share your thoughts or ask a question with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <Input
                  placeholder="e.g., Feeling overwhelmed with school, Tips for managing anxiety..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <Textarea
                  placeholder="Share your thoughts, experiences, or ask for advice. Remember to keep it anonymous and supportive."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    aria-label="Post anonymously"
                    checked={newPost.is_anonymous}
                    onCheckedChange={(checked) => setNewPost({ ...newPost, is_anonymous: checked })}
                  />
                  <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                    Post anonymously (recommended)
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit for Review"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Post Detail View */}
      {selectedPost && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedPost.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {selectedPost.is_anonymous ? "Anonymous" : "Public"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button variant="ghost" onClick={closePost}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            {/* Replies Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Replies</h3>
              <div className="mt-4">
                <form onSubmit={createReply} className="flex items-start gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write your reply..."
                      value={newReply.content}
                      onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
                      className="min-h-[80px]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="reply-anonymous"
                        aria-label="Reply anonymously"
                        checked={newReply.is_anonymous}
                        onCheckedChange={(checked) => setNewReply({ ...newReply, is_anonymous: checked })}
                      />
                      <label htmlFor="reply-anonymous" className="text-xs text-gray-500">
                        Reply anonymously
                      </label>
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Reply"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Replies List */}
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {reply.is_anonymous ? "Anonymous" : "Public"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
                {replies.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No replies yet. Be the first to offer support!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {!selectedPost && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6" onClick={() => openPost(post)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {post.is_anonymous ? "Anonymous" : "Public"}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Reply className="h-3 w-3" />
                          Click to view & reply
                        </span>
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-gray-400 ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to start a conversation in our supportive community
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AnonymousForum;
