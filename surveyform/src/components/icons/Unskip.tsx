import { IconWrapper, IconProps } from "./IconWrapper";

export const Unskip = (props: IconProps) => (
  <IconWrapper {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props.svgProps}
    >
      <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
      <line x1="3" y1="22" x2="21" y2="22"></line>
    </svg>
  </IconWrapper>
);
