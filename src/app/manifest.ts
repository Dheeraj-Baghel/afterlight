import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "AFTERLIGHT — An Interactive Atlas of Worlds", short_name: "AFTERLIGHT", description: "Find your next world.", start_url: "/", display: "browser", background_color: "#080d12", theme_color: "#080d12", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}