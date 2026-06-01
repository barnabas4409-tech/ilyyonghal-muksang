import Link from 'next/link';

interface Props {
  title: string;
  hint?: string;
  cta?: { label: string; href: string };
  variant?: 'fullscreen' | 'inline';
}

export default function EmptyState({ title, hint, cta, variant = 'fullscreen' }: Props) {
  const wrap =
    variant === 'fullscreen'
      ? 'flex flex-col min-h-dvh items-center justify-center px-5 text-center space-y-3'
      : 'py-12 px-5 text-center space-y-2';

  return (
    <div className={wrap}>
      <p className="text-foreground font-medium">{title}</p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="inline-block mt-3 px-6 py-3 btn-gold rounded-2xl text-sm font-medium"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
