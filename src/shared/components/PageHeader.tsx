interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  accentColor?: string;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  accentColor = "bg-orange-neon",
}: PageHeaderProps) {
  return (
    <div className="bg-teal-dark neo-border border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 ${accentColor} neo-border flex items-center justify-center text-3xl`}
          >
            {icon}
          </div>
          <div>
            <h1 className="font-black text-3xl text-bone uppercase tracking-tight">
              {title}
            </h1>
            <p className="text-bone-muted text-sm font-mono mt-1">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
