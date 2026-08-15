import { ImageResponse } from "next/og";

export const alt = "CareerAtlas — Global Career, Salary & Education Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          CareerAtlas
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            marginTop: 24,
            maxWidth: 900,
            color: "#a3a3a3",
          }}
        >
          Explore salaries, career transitions, education ROI, and industry momentum across 50+ industries.
        </div>
      </div>
    ),
    { ...size }
  );
}
