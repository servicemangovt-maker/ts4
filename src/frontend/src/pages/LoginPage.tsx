import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  // For signup
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[350px]">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#000] border border-[#262626] rounded-sm px-10 py-10 mb-3"
        >
          {/* Logo */}
          <div className="text-center mb-7">
            <h1
              className="text-5xl font-bold insta-gradient-text"
              style={{ fontFamily: "cursive, Georgia, serif" }}
            >
              ts4
            </h1>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Username / Phone / Email */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Phone number, username, or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-[#121212] border border-[#363636] text-white text-xs h-9 rounded-sm px-3 placeholder:text-[#737373] focus:border-[#a8a8a8] focus-visible:ring-0"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#121212] border border-[#363636] text-white text-xs h-9 rounded-sm px-3 pr-10 placeholder:text-[#737373] focus:border-[#a8a8a8] focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a8a8a8] hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Login button */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-8 rounded-lg text-sm font-semibold text-white insta-gradient border-0 hover:opacity-90 transition-opacity"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging
                      in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[#262626]" />
                <span className="text-xs text-[#737373] font-semibold">OR</span>
                <div className="flex-1 h-px bg-[#262626]" />
              </div>

              {/* Continue with Internet Identity */}
              <button
                type="button"
                onClick={login}
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
              >
                <span>🔒</span>
                Log in with Internet Identity
              </button>

              {/* Forgot password */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={login}
                  className="text-xs text-[#e0e0e0] hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSubmit} className="space-y-2">
              <p className="text-center text-sm text-[#a8a8a8] mb-4 leading-snug">
                Sign up to see photos and videos from your friends.
              </p>

              {/* Phone number */}
              <Input
                type="tel"
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#121212] border border-[#363636] text-white text-xs h-9 rounded-sm px-3 placeholder:text-[#737373] focus:border-[#a8a8a8] focus-visible:ring-0"
              />

              {/* Full name */}
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#121212] border border-[#363636] text-white text-xs h-9 rounded-sm px-3 placeholder:text-[#737373] focus:border-[#a8a8a8] focus-visible:ring-0"
              />

              {/* Username */}
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#121212] border border-[#363636] text-white text-xs h-9 rounded-sm px-3 placeholder:text-[#737373] focus:border-[#a8a8a8] focus-visible:ring-0"
              />

              {/* Password */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#121212] border border-[#363636] text-white text-xs h-9 rounded-sm px-3 pr-10 placeholder:text-[#737373] focus:border-[#a8a8a8] focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a8a8a8] hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-[10px] text-[#737373] text-center leading-relaxed">
                People who use our service may have uploaded your contact
                information to ts4.
              </p>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-8 rounded-lg text-sm font-semibold text-white insta-gradient border-0 hover:opacity-90 transition-opacity mt-1"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing
                    up...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          )}
        </motion.div>

        {/* Toggle login / signup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#000] border border-[#262626] rounded-sm py-5 text-center mb-6"
        >
          {mode === "login" ? (
            <p className="text-sm text-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[#0095f6] font-semibold hover:opacity-70 transition-opacity"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-foreground">
              Have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#0095f6] font-semibold hover:opacity-70 transition-opacity"
              >
                Log in
              </button>
            </p>
          )}
        </motion.div>

        {/* Get the app */}
        <div className="text-center">
          <p className="text-sm text-foreground mb-4">Get the app.</p>
          <div className="flex items-center justify-center gap-2">
            <div className="border border-[#262626] rounded px-3 py-1.5 text-xs text-foreground">
              App Store
            </div>
            <div className="border border-[#262626] rounded px-3 py-1.5 text-xs text-foreground">
              Google Play
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#737373]">
            © {new Date().getFullYear()} ts4. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
