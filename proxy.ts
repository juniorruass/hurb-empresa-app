import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Antes disso o app inteiro era protegido por uma senha única
 * compartilhada (lib/auth/app-gate.ts, removido) -- sem noção de usuário
 * ou empresa. Agora é sessão real do Supabase Auth: cada empresa-cliente
 * loga com a própria credencial (ver app/login/page.tsx e
 * supabase/migrations/017_client_portal.sql).
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|upflu-logo.png|upflu-icon.png|icon-192.png|icon-512.png|icon-512-maskable.png|apple-touch-icon.png|manifest.webmanifest|login|api/auth/login|api/webhooks/lead).*)",
  ],
};
