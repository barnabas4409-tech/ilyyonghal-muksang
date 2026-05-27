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
      <p className="text-sm font-medium text-[#2C2416] dark:text-[#E8DCC8] mb-1">{label}</p>
      {description && (
        <p className="text-xs text-[#C4A882] mb-3">{description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              value === opt.value
                ? 'bg-[#8B7355] text-[#F7F4EF]'
                : 'bg-[#EDE7DC] dark:bg-[#1E1B14] text-[#8B7355]'
            } ${opt.badge ? 'opacity-60' : ''}`}
          >
            {opt.label}
            {opt.badge && <span className="ml-1 opacity-70">{opt.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
