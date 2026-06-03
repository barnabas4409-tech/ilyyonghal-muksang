export interface ShareImageOptions {
  text: string;
  passage?: string;
  displayName?: string | null;
}

export async function generateShareImage({ text, passage, displayName }: ShareImageOptions): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  const W = 1080;
  const H = 1080;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  // 배경 — 크림 화이트
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#F8F7F4');
  bg.addColorStop(1, '#EFECe6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 앱 이름 — 상단
  ctx.fillStyle = '#8B7355';
  ctx.font = '500 28px "Pretendard Variable", sans-serif';
  ctx.letterSpacing = '0.18em';
  ctx.textAlign = 'center';
  ctx.fillText('일용할묵상', W / 2, 90);

  // 구분선
  ctx.strokeStyle = '#C4A882';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, 110);
  ctx.lineTo(W / 2 + 60, 110);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 인용 텍스트 — 중앙 세리프
  ctx.fillStyle = '#171411';
  ctx.font = '300 52px "Noto Serif KR", serif';
  ctx.letterSpacing = '0';
  ctx.textAlign = 'center';

  const maxWidth = 860;
  const lineHeight = 88;
  const lines = wrapText(ctx, `"${text}"`, maxWidth);
  const totalHeight = lines.length * lineHeight;
  const startY = (H - totalHeight) / 2 + 20;

  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineHeight);
  });

  // 출처 구절
  if (passage) {
    ctx.fillStyle = '#8B7355';
    ctx.font = '400 26px "Pretendard Variable", sans-serif';
    ctx.letterSpacing = '0.12em';
    ctx.fillText(`— ${passage}`, W / 2, startY + totalHeight + 60);
  }

  // 하단 — 닉네임 또는 앱 URL
  ctx.fillStyle = '#A89070';
  ctx.font = '400 22px "Pretendard Variable", sans-serif';
  ctx.letterSpacing = '0.05em';
  ctx.fillText(displayName ? `${displayName}의 말씀` : 'ilyyonghal-muksang.vercel.app', W / 2, H - 60);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let current = '';

  for (const char of words) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
