import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers de segurança básicos -- CSP fica de fora por enquanto (precisa
  // de teste exaustivo com Recharts/hidratação do Next antes de habilitar
  // sem quebrar a aplicação).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
