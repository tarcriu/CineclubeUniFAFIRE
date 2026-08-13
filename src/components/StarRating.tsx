import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
};

export function StarRating({ value, onChange, size = 24, readOnly = false }: Props) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
          className={
            readOnly
              ? "cursor-default"
              : "cursor-pointer transition-transform hover:scale-115"
          }
        >
          <Star
            style={{ width: size, height: size }}
            className={
              n <= active
                ? "fill-primary text-primary"
                : "text-muted-foreground/50"
            }
          />
        </button>
      ))}
    </div>
  );
}
