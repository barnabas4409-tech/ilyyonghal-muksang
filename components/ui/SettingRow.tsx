'use client';

interface Option<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface Props<T extends string> {
  label: string;
  description?: string;
  options: Option<T>[];
  value: T;
  onChange: (val: T) => void;
}

export default function SettingRow<T extends string>({
  label, description, options, value, onChange,
}: Props<T>) {
  return (
    <div className="py-4">
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-xs font-medium liquid-transition ${
              value === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            } ${opt.badge ? 'opacity-50' : ''}`}
          >
            {opt.label}
            {opt.badge && <span className="ml-1">({opt.badge})</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
