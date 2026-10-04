import { ImageResponse } from "next/og";

const VARIANTS = {
  "180": { size: 180, maskable: false },
  "192": { size: 192, maskable: false },
  "512": { size: 512, maskable: false },
  "maskable-192": { size: 192, maskable: true },
  "maskable-512": { size: 512, maskable: true },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> },
) {
  const { variant } = await params;
  const config = VARIANTS[variant as keyof typeof VARIANTS];

  if (!config) {
    return new Response("Icon not found", { status: 404 });
  }

  const { size, maskable } = config;
  const inset = maskable ? Math.round(size * 0.28) : Math.round(size * 0.23);
  const stroke = Math.max(12, Math.round(size * 0.058));

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 48%, #7c3aed 100%)",
          borderRadius: maskable ? 0 : Math.round(size * 0.22),
        }}
      >
        <div
          style={{
            position: "relative",
            width: size - inset * 2,
            height: size - inset * 2,
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: stroke,
              borderRadius: stroke,
              background: "#faf9f6",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: stroke,
              borderRadius: stroke,
              background: "#faf9f6",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: stroke,
              transform: "translateY(-50%)",
              borderRadius: stroke,
              background: "#faf9f6",
            }}
          />
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );

  response.headers.set(
    "Cache-Control",
    "public, max-age=31536000, immutable",
  );

  return response;
}
