import { ImageResponse } from "next/server";

// ()=><link
// rel="icon"
// href="data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔒</text></svg>"
// />

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/svg";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="220 0 100 100">
        <text y=".9em" font-size="90">
          🔒
        </text>
      </svg>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
