import { useActionState, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { api } from "@/api";
import { ApiClientError } from "@/api/client";
import { Input, Btn } from "@/components/ui";
import { FerriteMark } from "@/components/layout/Brand";

/**
 * What the box wants: a password, the API key (a key and no password), or
 * nothing at all (no password, no key).
 */
type Need = "password" | "api_key" | "nothing";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [need, setNeed] = useState<Need | null>(null);

  // Signed in already — a home-screen app opens here, at the address it was
  // added from: straight in, when the box vouched for a session or the key.
  // "No password" isn't followed on its own: a box before 0.2.2 says it for
  // one with an API key too, whose every other call then sends us back here.
  useEffect(() => {
    api
      .authStatus()
      .then((s) => {
        if (s.authenticated && (s.password_set || s.api_key_only))
          navigate("/", { replace: true });
        else if (s.authenticated) setNeed("nothing");
        else setNeed(s.api_key_only ? "api_key" : "password");
      })
      .catch(() => setNeed("password"));
  }, [navigate]);

  const [error, submit, pending] = useActionState<string, FormData>(async (_prev, formData) => {
    const secret = String(formData.get("secret") ?? "");
    try {
      if (need === "api_key") await api.signInWithKey(secret);
      else await api.login(secret);
      navigate("/", { replace: true });
      return "";
    } catch (e) {
      if (need === "api_key") return t("login.invalid_api_key");
      if (e instanceof ApiClientError && e.status !== 401) return e.message;
      return t("login.invalid_password");
    }
  }, "");

  return (
    <div className="app-canvas bg-void flex min-h-screen items-center justify-center p-6">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <FerriteMark className="mb-5 h-16 w-16" />
          <h1 className="display-title text-heading text-3xl">Ferrite</h1>
          <p className="text-muted mt-2 text-xs font-medium">
            DNS · Control · Plane
          </p>
        </div>

        {need === "nothing" && (
          <div className="control-surface border-bdr/85 rounded-xs space-y-4 border p-6 text-center">
            <p className="text-muted text-xs leading-relaxed">{t("login.no_password")}</p>
            <Btn type="button" block onClick={() => navigate("/", { replace: true })}>
              {t("login.open_panel")}
            </Btn>
          </div>
        )}

        {need && need !== "nothing" && (
          <form
            action={submit}
            className="control-surface border-bdr/85 rounded-xs space-y-4 border p-6"
          >
            <h2 className="text-heading text-center text-xs font-medium">
              {t("login.sign_in")}
            </h2>
            {need === "api_key" && (
              <p className="text-muted text-xs leading-relaxed">{t("login.api_key_only")}</p>
            )}
            <div className="space-y-1.5">
              <label className="text-muted block text-xs">
                {need === "api_key" ? t("login.api_key_label") : t("login.password_label")}
              </label>
              <Input
                key={need}
                type="password"
                name="secret"
                autoFocus
                autoComplete={need === "api_key" ? "off" : "current-password"}
                placeholder="••••••••"
                className="w-full"
              />
            </div>
            {error && <p className="text-blocked text-xs">{error}</p>}
            <Btn type="submit" disabled={pending} block>
              {pending ? t("login.submitting") : t("login.submit")}
            </Btn>
          </form>
        )}
      </div>
    </div>
  );
}
