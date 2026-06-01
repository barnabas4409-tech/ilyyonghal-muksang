'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  groupId: string;
  userId: string;
  date: string;
}

export default function CheckInSheet({ groupId, userId, date }: Props) {
  const [checked, setChecked] = useState<'loading' | 'done' | 'none'>('loading');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const { data } = await supabase
        .from('devotion_checks')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .eq('date', date)
        .single();
      setChecked(data ? 'done' : 'none');
    }
    checkExisting();
  }, [userId, groupId, date]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${groupId}/${date}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('devotion-photos')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      const msg = uploadError.message?.toLowerCase() ?? '';
      if (msg.includes('not found') || msg.includes('bucket')) {
        setError('업로드 저장소를 준비 중이에요. 잠시 후 다시 시도해주세요.');
      } else {
        setError('사진 업로드에 실패했어요. 다시 시도해주세요.');
      }
      return;
    }

    const { data: urlData } = supabase.storage
      .from('devotion-photos')
      .getPublicUrl(path);

    const { error: dbError } = await supabase.from('devotion_checks').upsert({
      user_id: userId,
      group_id: groupId,
      date,
      photo_url: urlData.publicUrl,
      caption: caption.trim() || null,
    }, { onConflict: 'user_id,group_id,date' });

    setUploading(false);
    if (dbError) {
      setError('인증 저장 중 문제가 발생했어요.');
      return;
    }
    setChecked('done');
  }

  if (checked === 'loading') return null;

  if (checked === 'done') {
    return (
      <div className="p-4 bg-primary/5 rounded-2xl text-center space-y-1">
        <p className="text-sm font-medium text-primary">인증 완료 🙏</p>
        <p className="text-xs text-muted-foreground">소그룹 피드에 올라갔어요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">소그룹 인증</p>

      {!preview ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 liquid-transition active:scale-[0.98]"
        >
          <span className="text-2xl">📷</span>
          <p className="text-xs text-muted-foreground">사진 선택하기</p>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="인증 사진 미리보기" className="w-full h-48 object-cover" />
          <button
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      <input
        type="text"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder="한 마디 남기기 (선택)"
        maxLength={80}
        className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />

      {error && (
        <p className="text-xs text-orange-600 dark:text-orange-400 px-1">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
      >
        {uploading ? '올리는 중...' : '인증하기'}
      </button>
    </div>
  );
}
