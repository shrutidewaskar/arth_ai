import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const error = searchParams.get("error");
  const error_code = searchParams.get("error_code");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // 1. If Supabase returned an error in the query parameters
  if (error || error_code) {
    const errorUrl = new URL(`${origin}/auth/verify-error`);
    if (error) errorUrl.searchParams.set("error", error);
    if (error_code) errorUrl.searchParams.set("error_code", error_code);
    if (error_description) errorUrl.searchParams.set("error_description", error_description);
    return NextResponse.redirect(errorUrl.toString());
  }

  const supabase = await createClient();

  // 2. PKCE Authorization Code Exchange
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      const errorUrl = new URL(`${origin}/auth/verify-error`);
      errorUrl.searchParams.set("error", "code_exchange_failed");
      errorUrl.searchParams.set("error_description", exchangeError.message);
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // 3. Token Hash Verification (Email Confirmation Link fallback)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    if (!verifyError) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      const errorUrl = new URL(`${origin}/auth/verify-error`);
      errorUrl.searchParams.set("error", "otp_expired");
      errorUrl.searchParams.set("error_description", verifyError.message);
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // If no valid auth parameters were provided
  return NextResponse.redirect(`${origin}/`);
}
