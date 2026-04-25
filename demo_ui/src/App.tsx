/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, GitFork, ExternalLink, Code2, Activity, Star, Clock, 
  Copy, Check, Users, BookOpen, ArrowUpDown, Github, 
  Plus, FolderPlus, MoreVertical, Trash2, Pencil, LayoutGrid,
  ChevronRight, Box, Settings, LogOut, Info, X
} from 'lucide-react';
import Fuse from 'fuse.js';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';

// --- Types ---
type Repo = {
  id: string;
  name: string;
  description: string;
  isFork: boolean;
  primaryLanguage: string;
  lastCommitAt: string;
  url: string;
  localPath: string;
  stars: number;
};

type Space = {
  id: string;
  title: string;
  description: string;
  repoIds: string[];
};

type SortOption = 'updated' | 'stars' | 'name';

// --- Mock Data ---
const MOCK_USER = {
  name: "Alex Developer",
  handle: "alexdev",
  avatar: "https://github.com/shadcn.png",
  bio: "Building tools for developers. Open source enthusiast & UI engineer.",
};

const INITIAL_REPOS: Repo[] = [
  { id: '1', name: 'RepoPulse', description: 'The Zero-Friction Dashboard for managing GitHub repositories.', isFork: false, primaryLanguage: 'TypeScript', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), url: 'https://github.com/user/repopulse', localPath: '/Users/dev/repopulse', stars: 128 },
  { id: '2', name: 'StreakUp', description: 'Gamified habit tracker for developers.', isFork: false, primaryLanguage: 'TypeScript', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), url: 'https://github.com/user/streakup', localPath: '/Users/dev/streakup', stars: 45 },
  { id: '3', name: 'Castoffs', description: 'Abandoned but useful code snippets.', isFork: false, primaryLanguage: 'JavaScript', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), url: 'https://github.com/user/castoffs', localPath: '/Users/dev/castoffs', stars: 8 },
  { id: '4', name: 'next.js', description: 'The React Framework', isFork: true, primaryLanguage: 'TypeScript', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), url: 'https://github.com/user/next.js', localPath: '/Users/dev/next.js', stars: 0 },
  { id: '5', name: 'shadcn-ui', description: 'UI components library.', isFork: true, primaryLanguage: 'TypeScript', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), url: 'https://github.com/user/ui', localPath: '/Users/dev/ui', stars: 1 },
  { id: '6', name: 'personal-website', description: 'My portfolio and blog.', isFork: false, primaryLanguage: 'React', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), url: 'https://github.com/user/site', localPath: '/Users/dev/site', stars: 3 },
  { id: '7', name: 'rust-cli', description: 'Fast log processor in Rust.', isFork: false, primaryLanguage: 'Rust', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), url: 'https://github.com/user/cli', localPath: '/Users/dev/cli', stars: 22 },
  { id: '8', name: 'py-data', description: 'Data analysis scripts.', isFork: false, primaryLanguage: 'Python', lastCommitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), url: 'https://github.com/user/data', localPath: '/Users/dev/data', stars: 5 },
];

const INITIAL_SPACES: Space[] = [
  { id: 's1', title: 'Work Projects', description: 'Core projects active for my daily job.', repoIds: ['1', '2'] },
  { id: 's2', title: 'Experiments', description: 'Fast-moving side projects and prototypes.', repoIds: ['6', '7'] },
  { id: 's3', title: 'Reference & Forks', description: 'Learning materials and code reviews.', repoIds: ['4', '5'] },
];

// --- Helpers ---
const getLanguageColor = (lang: string) => {
  switch (lang.toLowerCase()) {
    case 'typescript': return 'border-blue-500/50 text-blue-400';
    case 'javascript': return 'border-yellow-500/50 text-yellow-400';
    case 'react': return 'border-cyan-500/50 text-cyan-400';
    case 'rust': return 'border-orange-500/50 text-orange-400';
    case 'python': return 'border-green-500/50 text-green-400';
    default: return 'border-gray-500/50 text-gray-400';
  }
};

const isRecentlyActive = (dateString: string) => {
  const diffDays = Math.ceil(Math.abs(Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

// --- Components ---

function Modal({ title, children, onClose, onSave }: { title: string, children: React.ReactNode, onClose: () => void, onSave: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
        </div>
        <div className="p-6 space-y-4">
          {children}
        </div>
        <div className="p-6 bg-muted/20 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  // State
  const [repos] = useState<Repo[]>(INITIAL_REPOS);
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [activeSpaceId, setActiveSpaceId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideForks, setHideForks] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Partial<Space> | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search Logic
  const fuse = useMemo(() => new Fuse(repos, {
    keys: ['name', 'description', 'primaryLanguage'],
    threshold: 0.3,
  }), [repos]);

  const filteredRepos = useMemo(() => {
    let result = [...repos];

    // Filter by Space
    if (activeSpaceId !== 'all') {
      const activeSpace = spaces.find(s => s.id === activeSpaceId);
      if (activeSpace) {
        result = result.filter(r => activeSpace.repoIds.includes(r.id));
      }
    }

    // Filter by Forks
    if (hideForks) {
      result = result.filter(repo => !repo.isFork);
    }

    // Search
    if (searchQuery) {
      result = fuse.search(searchQuery).map(res => res.item);
    }

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'updated') return new Date(b.lastCommitAt).getTime() - new Date(a.lastCommitAt).getTime();
      if (sortBy === 'stars') return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    });
  }, [repos, spaces, activeSpaceId, hideForks, searchQuery, sortBy, fuse]);

  // Derived Stats
  const activeSpace = spaces.find(s => s.id === activeSpaceId);
  const stats = {
    total: filteredRepos.length,
    stars: filteredRepos.reduce((acc, r) => acc + r.stars, 0),
  };

  // Actions
  const handleCreateSpace = () => {
    setEditingSpace({ id: `s${Date.now()}`, title: '', description: '', repoIds: [] });
    setIsSpaceModalOpen(true);
  };

  const handleEditSpace = (s: Space) => {
    setEditingSpace(s);
    setIsSpaceModalOpen(true);
  };

  const handleDeleteSpace = (id: string) => {
    setSpaces(prev => prev.filter(s => s.id !== id));
    if (activeSpaceId === id) setActiveSpaceId('all');
  };

  const saveSpace = () => {
    if (!editingSpace?.title) return;
    setSpaces(prev => {
      const exists = prev.find(s => s.id === editingSpace.id);
      if (exists) return prev.map(s => s.id === editingSpace.id ? (editingSpace as Space) : s);
      return [...prev, editingSpace as Space];
    });
    setIsSpaceModalOpen(false);
  };

  const toggleRepoInSpace = (repoId: string, spaceId: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        const hasRepo = s.repoIds.includes(repoId);
        return {
          ...s,
          repoIds: hasRepo ? s.repoIds.filter(id => id !== repoId) : [...s.repoIds, repoId]
        };
      }
      return s;
    }));
  };

  const handleCopyClone = (id: string, url: string) => {
    navigator.clipboard.writeText(`${url}.git`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans selection:bg-primary/20">
      
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card/30 flex flex-col hidden lg:flex sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">RepoPulse</h1>
          </div>
        </div>

        <nav className="flex-grow px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">System</div>
          <button 
            onClick={() => setActiveSpaceId('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSpaceId === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              All Projects
            </div>
            <Badge variant={activeSpaceId === 'all' ? 'secondary' : 'outline'} className="text-[10px]">{repos.length}</Badge>
          </button>

          <div className="pt-6 px-3 mb-2 flex items-center justify-between group">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">Spaces</span>
            <button onClick={handleCreateSpace} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {spaces.map(s => (
            <div key={s.id} className="relative group">
              <button 
                onClick={() => setActiveSpaceId(s.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSpaceId === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Box className="w-4 h-4 opacity-70" />
                  <span className="truncate">{s.title}</span>
                </div>
                <Badge variant={activeSpaceId === s.id ? 'secondary' : 'outline'} className="text-[10px]">{s.repoIds.length}</Badge>
              </button>
              
              <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEditSpace(s); }} className="p-1 hover:bg-muted/50 rounded"><Pencil className="w-3 h-3"/></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteSpace(s.id); }} className="p-1 hover:bg-destructive/20 text-destructive rounded"><Trash2 className="w-3 h-3"/></button>
              </div>
            </div>
          ))}

          <div className="pt-8">
             <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
              onClick={handleCreateSpace}
            >
               <FolderPlus className="w-4 h-4" />
               New Space
             </Button>
          </div>
        </nav>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent cursor-pointer transition-colors">
            <img src={MOCK_USER.avatar} alt="" className="w-8 h-8 rounded-full border border-primary/20" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">{MOCK_USER.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">@{MOCK_USER.handle}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-6 md:p-8 lg:p-12 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
              Dashboard / {activeSpaceId === 'all' ? 'All Projects' : 'Space'}
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {activeSpaceId === 'all' ? 'Repo Command Center' : activeSpace?.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {activeSpaceId === 'all' 
                ? "Unified view of all your codebases across platforms." 
                : activeSpace?.description || "Manage select repositories for this context."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 min-w-[120px] shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Active Focus</span>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 min-w-[120px] shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Collective Stars</span>
              <span className="text-2xl font-bold text-yellow-500">{stats.stars}</span>
            </div>
          </div>
        </div>

        {/* Filters Sticky */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl -mx-4 px-4 py-2 flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-grow max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Fuzzy search repos, languages, or notes..." 
              className="pl-11 h-12 bg-card/50 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3">
             <div className="relative h-12 border bg-card/50 rounded-xl px-3 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-medium focus:outline-none pr-4 outline-none appearance-none"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                >
                  <option value="updated">Latest Activity</option>
                  <option value="stars">Most Starred</option>
                  <option value="name">Name A-Z</option>
                </select>
             </div>
             <div className="h-12 border bg-card/50 rounded-xl px-4 flex items-center gap-3">
                <Switch checked={hideForks} onCheckedChange={setHideForks} title="Hide forked repos" />
                <span className="text-xs font-semibold select-none">Hide Forks</span>
             </div>
          </div>
        </div>

        {/* Content Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredRepos.map(repo => {
              const active = isRecentlyActive(repo.lastCommitAt);
              const langStyle = getLanguageColor(repo.primaryLanguage);
              const isCopied = copiedId === repo.id;

              return (
                <motion.div
                  layout
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className={`h-full flex flex-col group border-border/50 hover:border-primary/40 transition-all duration-300 ${repo.isFork ? 'opacity-70 grayscale-[0.5] hover:grayscale-0' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1">
                            <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                              {repo.isFork && <GitFork className="w-4 h-4 text-muted-foreground opacity-60" />}
                              <CardTitle className="text-lg font-bold truncate">{repo.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                               {active && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse ring-2 ring-green-500/20" />}
                               <span>{formatDistanceToNow(new Date(repo.lastCommitAt), { addSuffix: true })}</span>
                            </div>
                         </div>
                         <DropdownMenu repos={repos} repo={repo} spaces={spaces} onToggle={toggleRepoInSpace} />
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium line-clamp-2">
                        {repo.description || "Experimental codebase without public documentation yet."}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-4 flex flex-col gap-4">
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`rounded-md bg-muted/20 ${langStyle}`}>
                            {repo.primaryLanguage}
                          </Badge>
                          {repo.stars > 0 && (
                             <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {repo.stars}
                             </div>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                           <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopyClone(repo.id, repo.url)} title="Copy Clone URL">
                              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                           </Button>
                           <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Open Local">
                              <a href={`vscode://file${repo.localPath}`}><Code2 className="w-4 h-4" /></a>
                           </Button>
                           <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="GitHub">
                              <a href={repo.url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a>
                           </Button>
                        </div>
                      </div>

                      {activeSpaceId === 'all' && (
                        <div className="flex flex-wrap gap-1.5 border-t pt-3">
                           {spaces.filter(s => s.repoIds.includes(repo.id)).map(s => (
                             <Badge key={s.id} variant="secondary" className="px-1.5 py-0 text-[9px] font-bold tracking-tight uppercase opacity-60">
                                {s.title}
                             </Badge>
                           ))}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Modals */}
      {isSpaceModalOpen && (
        <Modal 
          title={editingSpace?.title ? "Edit Space" : "New Environment Space"}
          onClose={() => setIsSpaceModalOpen(false)}
          onSave={saveSpace}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Project Context Name</label>
            <Input 
              value={editingSpace?.title || ''} 
              onChange={e => setEditingSpace(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Work Main, Side Hustles..." 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Focus Statement</label>
            <Input 
              value={editingSpace?.description || ''} 
              onChange={e => setEditingSpace(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this space..." 
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- Dynamic Dropdown Helper ---
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";

function DropdownMenu({ spaces, repo, onToggle }: { repo: Repo, spaces: Space[], onToggle: (r: string, s: string) => void }) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
      </DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content align="end" className="z-50 min-w-[180px] overflow-hidden rounded-xl border bg-card p-1 shadow-xl animate-in fade-in zoom-in duration-200">
           <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground opacity-60">Assign to Space</div>
           {spaces.map(s => {
             const active = s.repoIds.includes(repo.id);
             return (
               <DropdownPrimitive.Item 
                key={s.id}
                onSelect={(e) => { e.preventDefault(); onToggle(repo.id, s.id); }}
                className="flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-accent cursor-pointer outline-none"
               >
                 <div className="flex items-center gap-2">
                    <Box className={`w-4 h-4 ${active ? 'text-primary' : 'opacity-40'}`} />
                    <span>{s.title}</span>
                 </div>
                 {active && <Check className="w-3 h-3 text-primary" />}
               </DropdownPrimitive.Item>
             );
           })}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

