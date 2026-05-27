interface Props {
  reflectionDates: string[];
}

export default function StreakDots({ reflectionDates }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="flex items-center gap-2 justify-center">
      {days.map((day) => {
        const done = reflectionDates.includes(day);
        const isToday = day === new Date().toISOString().split('T')[0];
        return (
          <div
            key={day}
            className={`w-3 h-3 rounded-full transition-all ${
              done
                ? 'bg-[#8B7355]'
                : isToday
                ? 'bg-[#C4A882] ring-2 ring-[#8B7355] ring-offset-2 ring-offset-[#F7F4EF] dark:ring-offset-[#16140F]'
                : 'bg-[#EDE7DC] dark:bg-[#1E1B14]'
            }`}
          />
        );
      })}
    </div>
  );
}
