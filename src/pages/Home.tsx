import { useState } from 'react';
import { Sparkles, PenSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { PostCard } from '@/components/PostCard';
import { Composer } from '@/components/Composer';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const [composerOpen, setComposerOpen] = useState(false);
  const { posts } = useApp();

  return (
    <>
      <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Home</h1>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="border-b border-border">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Button
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-20 right-6 md:bottom-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg md:hidden"
        size="icon"
      >
        <PenSquare className="w-6 h-6" />
      </Button>

      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </>
  );
}
