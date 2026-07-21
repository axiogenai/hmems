import dynamic from "next/dynamic";
import { LucideProps } from "lucide-react";
import React from "react";

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const LazyIcon = React.useMemo(() => {
    return dynamic<LucideProps>(
      () =>
        import("lucide-react").then((mod) => {
          const IconComponent = (mod as any)[name];
          if (!IconComponent) {
            if (process.env.NODE_ENV === "development") {
              console.warn(`Lucide icon not found: ${name}`);
            }
            return { default: mod.Star };
          }
          return { default: IconComponent };
        }),
      {
        ssr: true,
        loading: () => <span className="inline-block w-5 h-5 bg-slate-200/50 animate-pulse rounded" />,
      }
    );
  }, [name]);

  return <LazyIcon {...props} />;
}
