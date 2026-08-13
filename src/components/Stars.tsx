import { Star } from "lucide-react";

export function StarsDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="relative inline-flex">
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className="fill-muted-foreground/25 text-transparent"
          />
        ))}
      </div>
      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{ width: `${(value / 5) * 100}%` }}
      >
        <div className="flex gap-[3px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              style={{ width: size, height: size, minWidth: size }}
              className="fill-primary text-transparent"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className="relative inline-block h-6 w-6">
            <Star className="h-6 w-6 fill-muted-foreground/35 text-transparent" />
            <span
              className="pointer-events-none absolute left-0 top-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-6 w-6 min-w-6 fill-primary text-transparent" />
            </span>
            <button
              type="button"
              aria-label={`${n - 0.5}`}
              onClick={() => onChange(n - 0.5)}
              className="absolute left-0 top-0 h-6 w-3"
            />
            <button
              type="button"
              aria-label={String(n)}
              onClick={() => onChange(n)}
              className="absolute right-0 top-0 h-6 w-3"
            />
          </span>
        );
      })}
    </div>
  );
}

