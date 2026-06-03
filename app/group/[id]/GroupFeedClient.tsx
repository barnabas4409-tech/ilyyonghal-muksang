'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
}

interface Reaction {
  id: string;
  sticker: string;
  user_id: string;
}

interface Check {
  id: string;
  user_id: string;
  photo_url: string | null;
  caption: string | null;
  userName: string | null;
  reactions: Reaction[];
}

interface MemberStatus {
  user_id: string;
  role: string;
  name: string | null;
  doneToday: boolean;
}

interface Props {
  groupId: string;
  groupName: string;
  inviteCode: string;
  userId: string;
  isLeader: boolean;
  posts: Post[];
  checks: Check[];
  memberStatus: MemberStatus[];
}

const STICKERS = [
  { emoji: '🙏', label: '아멘' },
  { emoji: '🔥', label: '뜨겁다' },
  { emoji: '❤️', label: '사랑해요' },
  { emoji: '🤝', label: '함께해요' },
];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CheckCard({ check, userId }: { check: Check; userId: string }) {
  const [reactions, setReactions] = useState<Reaction[]>(check.reactions);
  const [loading, setLoading] = useState(false);
  const myReaction = reactions.find(r => r.user_id === userId);

  async function handleReaction(sticker: string) {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    if (myReaction?.sticker === sticker) {
      await supabase.from('check_reactions').delete().eq('id', myReaction.id);
      setReactions(prev => prev.filter(r => r.id !== myReaction.id));
    } else {
      if (myReaction) await supabase.from('check_reactions').delete().eq('id', myReaction.id);
      const { data } = await supabase
        .from('check_reactions')
        .insert({ check_id: check.id, user_id: userId, sticker })
        .select().single();
      if (data) setReactions(prev => [...prev.filter(r => r.user_id !== userId), data]);
    }
    setLoading(false);
  }

  return (
    <div className="card-float overflow-hidden">
      {check.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={check.photo_url} alt="인증 사진" className="w-full aspect-square object-cover" />
      )}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-medium text-primary">
              {check.userName ? check.userName[0] : '?'}
            </span>
          </div>
          <p className="text-xs font-medium text-foreground truncate">{check.userName ?? '익명'}</p>
        </div>
        {check.caption && <p className="text-xs text-muted-foreground leading-relaxed">{check.caption}</p>}
        <div className="flex gap-1.5 flex-wrap">
          {STICKERS.map(({ emoji }) => {
            const count = reactions.filter(r => r.sticker === emoji).length;
            const active = myReaction?.sticker === emoji;
            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] liquid-transition-fast ${
                  active ? 'bg-primary/15 text-primary font-medium' : 'bg-muted/60 text-muted-foreground'
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function GroupFeedClient({ groupId, groupName, inviteCode, userId, isLeader, posts: initialPosts, checks, memberStatus }: Props) {
  const [copied, setCopied] = useState(false);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePost() {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('group_posts')
      .insert({ group_id: groupId, author_id: userId, content: newPost.trim() })
      .select().single();
    if (data) {
      setPosts(prev => [data, ...prev]);
      setNewPost('');
      setShowPostForm(false);
    }
    setPosting(false);
  }

  async function handleDeletePost(postId: string) {
    const supabase = createClient();
    await supabase.from('group_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-7 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-foreground">{groupName}</h1>
          {isLeader && (
            <button
              onClick={() => setShowPostForm(v => !v)}
              className="text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-full liquid-transition"
            >
              {showPostForm ? '취소' : '공지 올리기'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">오늘 {checks.length}명 인증</p>
          <span className="text-muted-foreground/30">·</span>
          <button onClick={handleCopyCode} className="text-xs text-muted-foreground font-mono liquid-transition">
            {copied ? '복사됨 ✓' : `초대 코드: ${inviteCode}`}
          </button>
        </div>
      </div>

      {/* 공지 글쓰기 폼 (리더) */}
      {showPostForm && (
        <div className="mx-5 mb-4 card-float p-4 space-y-3">
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="소그룹 전체에게 공지를 남겨요"
            rows={3}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
          />
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 liquid-transition"
          >
            {posting ? '올리는 중...' : '올리기'}
          </button>
        </div>
      )}

      {/* 리더 현황 — 오늘 묵상 완료 여부 */}
      {isLeader && memberStatus.length > 0 && (
        <div className="px-5 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">오늘의 현황</p>
            <p className="text-[10px] text-muted-foreground/60">
              {memberStatus.filter(m => m.doneToday).length}/{memberStatus.length}명 완료
            </p>
          </div>
          <div className="card-float p-3 space-y-1">
            {memberStatus.map(m => (
              <div key={m.user_id} className="flex items-center gap-3 py-1.5">
                <span className={`text-sm ${m.doneToday ? 'text-primary' : 'text-muted-foreground/30'}`}>
                  {m.doneToday ? '✓' : '○'}
                </span>
                <span className={`text-sm flex-1 ${m.doneToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {m.name ?? '이름 없음'}
                </span>
                {m.role === 'leader' && (
                  <span className="text-[10px] text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded-full">리더</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 공지 목록 */}
      {posts.length > 0 && (
        <div className="px-5 mb-5 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">공지</p>
          {posts.map(p => (
            <div key={p.id} className="card-float px-4 py-3 flex items-start gap-3">
              <span className="text-base mt-0.5">📌</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{p.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatTime(p.created_at)}</p>
              </div>
              {isLeader && (
                <button onClick={() => handleDeletePost(p.id)} className="text-muted-foreground/40 text-xs shrink-0">✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 피드 */}
      {checks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center space-y-2 pb-20">
          <p className="text-sm text-muted-foreground">오늘 아직 인증한 사람이 없어요</p>
          <p className="text-xs text-muted-foreground/60">묵상 후 첫 번째로 인증해보세요 🙏</p>
        </div>
      ) : (
        <div className="px-5 pb-8 grid grid-cols-2 gap-3">
          {checks.map(c => <CheckCard key={c.id} check={c} userId={userId} />)}
        </div>
      )}
    </div>
  );
}
