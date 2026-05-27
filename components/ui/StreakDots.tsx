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
            className={`w-2.5 h-2.5 rounded-full liquid-transition ${
              done
                ? 'bg-primary'
                : isToday
                ? 'bg-muted-foreground/30 ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'bg-muted'
            }`}
          />
        );
      })}
    </div>
  );
}
