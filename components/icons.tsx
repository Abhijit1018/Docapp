import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const PhoneIcon = (p: P) => (
  <Icon {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></Icon>
);
export const ChatIcon = (p: P) => (
  <Icon {...p}><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5A8.5 8.5 0 1 1 21 11.5Z" /></Icon>
);
export const CheckIcon = (p: P) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>;
export const CrossIcon = (p: P) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const BackIcon = (p: P) => <Icon {...p}><path d="M15 5l-7 7 7 7" /></Icon>;
export const ForwardIcon = (p: P) => <Icon {...p}><path d="M9 5l7 7-7 7" /></Icon>;
export const PlusIcon = (p: P) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const PinIcon = (p: P) => (
  <Icon {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Icon>
);
export const CalendarIcon = (p: P) => (
  <Icon {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Icon>
);
export const SearchIcon = (p: P) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></Icon>;
export const ResetIcon = (p: P) => (
  <Icon {...p}><path d="M4 12a8 8 0 1 0 2.6-5.9" /><path d="M4 4v5h5" /></Icon>
);
export const MenuIcon = (p: P) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const ClockIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>;
export const ShieldIcon = (p: P) => (
  <Icon {...p}><path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6l-7-2.5Z" /><path d="m9 12 2.2 2.2L15 10.4" /></Icon>
);
export const BellIcon = (p: P) => (
  <Icon {...p}><path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14l1.5-2Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></Icon>
);
export const ReceiptIcon = (p: P) => (
  <Icon {...p}><path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8v-17Z" /><path d="M9.5 8.500h5M9.5 12.500h5" /></Icon>
);

/** The clinic's mark: a medical cross on the brand blue. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect width="36" height="36" rx="9" fill="var(--color-accent)" />
      <path d="M15 9h6v6h6v6h-6v6h-6v-6H9v-6h6V9Z" fill="#fff" />
    </svg>
  );
}
export const ArrowIcon = (p: P) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
export const StarIcon = (p: P) => (
  <Icon {...p} fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.800l1.1-6.100L3.2 9.400l6.1-.800L12 3Z" /></Icon>
);
export const QuoteIcon = (p: P) => (
  <Icon {...p} fill="currentColor" stroke="none"><path d="M4 17v-4.500C4 8.9 6 6.5 9.5 6v2.500C8 9 7.2 10 7 11.500h2.500V17H4Zm10.5 0v-4.500c0-3.6 2-6 5.5-6.500v2.500c-1.5.5-2.3 1.5-2.5 3H20V17h-5.500Z" /></Icon>
);
