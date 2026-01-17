type IconProps = {
    size?: number;
    strokeWidth?: number;
    className?: string;
};

function IconBase({
    children,
    size = 20,
    strokeWidth = 1.8,
    className
}: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {children}
        </svg>
    );
}

export function SFPlus(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </IconBase>
    );
}

export function SFArrowUpRight(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M7 17L17 7" />
            <path d="M9 7h8v8" />
        </IconBase>
    );
}

export function SFArrowDownRight(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M7 7l10 10" />
            <path d="M9 17h8V9" />
        </IconBase>
    );
}

export function SFCalendar(props: IconProps) {
    return (
        <IconBase {...props}>
            <rect x="3" y="4.5" width="18" height="16.5" rx="3.5" />
            <path d="M3 9.5h18" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
            <path d="M7.5 13h3" />
            <path d="M13.5 13h3" />
        </IconBase>
    );
}

export function SFWallet(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M4 7h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
            <path d="M4 7V6a2 2 0 0 1 2-2h12" />
            <path d="M17 11h3" />
        </IconBase>
    );
}

export function SFDollar(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 2.5v17" />
            <path d="M16.2 7.4c0-1.9-1.8-3.1-4.2-3.1s-4.2 1.1-4.2 3.1 1.8 2.6 4.2 3.1 4.2 1.1 4.2 3.1-1.8 3.1-4.2 3.1-4.2-1.1-4.2-3.1" />
        </IconBase>
    );
}

export function SFBriefcase(props: IconProps) {
    return (
        <IconBase {...props}>
            <rect x="3" y="8" width="18" height="12" rx="2.5" />
            <path d="M9 8V6.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V8" />
            <path d="M3 12h18" />
        </IconBase>
    );
}

export function SFLightbulb(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M9 18h6" />
            <path d="M10 21h4" />
            <path d="M12 3a6 6 0 0 0-3.6 10.9c.7.5 1.1 1.2 1.1 2V17h5v-1.1c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 3z" />
        </IconBase>
    );
}

export function SFCheckCircle(props: IconProps) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </IconBase>
    );
}

export function SFSparkles(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 3l1.6 3.6L17 8l-3.4 1.4L12 13l-1.6-3.6L7 8l3.4-1.4L12 3z" />
            <path d="M18.5 14.5l.8 1.8 1.7.7-1.7.7-.8 1.8-.8-1.8-1.7-.7 1.7-.7.8-1.8z" />
        </IconBase>
    );
}

export function SFTarget(props: IconProps) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3" />
            <path d="M12 19v3" />
            <path d="M2 12h3" />
            <path d="M19 12h3" />
        </IconBase>
    );
}

export function SFTrendingUp(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M3 16l6-6 4 4 7-7" />
            <path d="M14 7h6v6" />
        </IconBase>
    );
}

export function SFClock(props: IconProps) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </IconBase>
    );
}

export function SFStar(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 3l2.6 5.3L20 9l-4 3.9L17 19l-5-2.8L7 19l1-6.1L4 9l5.4-.7L12 3z" />
        </IconBase>
    );
}
