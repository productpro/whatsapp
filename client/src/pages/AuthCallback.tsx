import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, LogIn, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const authError = params.get("error_description") || params.get("error");
        if (authError) throw new Error(authError.replace(/\+/g, " "));
        const code = params.get("code");
        const supabase = await getSupabase();
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("Email confirmation did not return a session. Please sign in manually.");
        window.history.replaceState({}, document.title, "/dashboard");
        setLocation("/dashboard");
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : "Email confirmation could not be completed.");
      }
    })();
  }, [setLocation]);

  return <div className="auth-screen"><div className="auth-card"><Link href="/" className="brand-lockup"><span className="brand-mark"><ShoppingBag size={18} /></span><span>QuickStore</span></Link>{error ? <><div className="auth-icon"><LogIn size={22} /></div><h1>Email confirmation didn’t finish.</h1><p>{error}</p><Link href="/dashboard" className="button button-blue button-lg button-wide">Return to sign in</Link><Link href="/" className="auth-back"><ArrowLeft size={14} /> Back to QuickStore home</Link></> : <><div className="auth-icon"><Loader2 size={22} className="spin" /></div><h1>Confirming your email…</h1><p>We’re securely setting up your merchant workspace.</p></>}</div></div>;
}
