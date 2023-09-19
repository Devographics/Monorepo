import React from "react";

function CommentDots({
  svgProps,
}: {
  svgProps?: React.HTMLAttributes<SVGElement>;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      strokeWidth="1.5"
      color="white"
      viewBox="0 0 24 24"
      {...svgProps}
    >
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 12.5a.5.5 0 100-1 .5.5 0 000 1zm-5 0a.5.5 0 100-1 .5.5 0 000 1zm-5 0a.5.5 0 100-1 .5.5 0 000 1z"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22z"
      ></path>
    </svg>
  );
}

export default CommentDots;
