import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    ArrowLeft, Loader, Eye, EyeOff, CheckCircle2,
    Mail, ShieldCheck, KeyRound, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/routes/common/routePath";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo/logo";
import { useTheme } from "@/context/theme-provider";
import dashboardImg from "../../assets/images/dashboard_.png";
import dashboardImgDark from "../../assets/images/dashboard_dark.png";
import {
    useForgotPasswordSendOtpMutation,
    useForgotPasswordVerifyOtpMutation,
    useForgotPasswordResetMutation,
} from "@/features/auth/authAPI";

// ─── Types ────────────────────────────────────────────────────────────────
type Step = "email" | "otp" | "reset" | "success";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

// ─── Password strength ────────────────────────────────────────────────────
interface PasswordStrength {
    score: number; // 0-4
    label: string;
    color: string;
    checks: { label: string; pass: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
    const checks = [
        { label: "At least 8 characters", pass: password.length >= 8 },
        { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
        { label: "Lowercase letter", pass: /[a-z]/.test(password) },
        { label: "Number", pass: /[0-9]/.test(password) },
        { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter((c) => c.pass).length;
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
    const colors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-500"];
    return { score, label: labels[score] || "", color: colors[score] || "", checks };
}

// ─── Step indicator ───────────────────────────────────────────────────────
const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "email", label: "Email", icon: <Mail className="w-3.5 h-3.5" /> },
    { id: "otp", label: "Verify", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "reset", label: "Reset", icon: <KeyRound className="w-3.5 h-3.5" /> },
];

function StepIndicator({ current }: { current: Step }) {
    const order: Step[] = ["email", "otp", "reset"];
    const currentIdx = order.indexOf(current);
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((step, i) => {
                const done = i < currentIdx;
                const active = step.id === current;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                            done && "bg-green-500/15 text-green-600 dark:text-green-400",
                            active && "bg-foreground text-background",
                            !done && !active && "text-muted-foreground",
                        )}>
                            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
                            <span>{step.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "h-px w-6 mx-1 transition-all duration-500",
                                i < currentIdx ? "bg-green-500" : "bg-border"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Step 1: Email ────────────────────────────────────────────────────────
const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

function EmailStep({ onSuccess }: { onSuccess: (email: string) => void }) {
    const [sendOtp, { isLoading }] = useForgotPasswordSendOtpMutation();

    const form = useForm<{ email: string }>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async ({ email }: { email: string }) => {
        try {
            await sendOtp({ email }).unwrap();
            toast.success("OTP sent to your email");
        } catch {
            toast("If this email exists, you'll receive an OTP shortly.");
        }
        onSuccess(email);
    };

    return (
        <div style={{ animation: "fpSlideIn 0.3s ease both" }}>
            <div className="flex flex-col items-center gap-2 text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Enter your account email and we'll send you a one-time code to reset your password.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="!font-normal">Email address</FormLabel>
                                <FormControl>
                                    <Input placeholder="you@example.com" type="email" autoComplete="email" autoFocus {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button disabled={isLoading} type="submit" className="w-full">
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Send OTP
                    </Button>
                </form>
            </Form>
        </div>
    );
}

// ─── Step 2: OTP ──────────────────────────────────────────────────────────
function OtpStep({
    email,
    onSuccess,
    onResend,
}: {
    email: string;
    onSuccess: () => void;
    onResend: () => void;
}) {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [verifyOtp, { isLoading }] = useForgotPasswordVerifyOtpMutation();
    const [sendOtp, { isLoading: isSending }] = useForgotPasswordSendOtpMutation();

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const focusNext = (index: number) => inputRefs.current[index + 1]?.focus();
    const focusPrev = (index: number) => inputRefs.current[index - 1]?.focus();

    const handleChange = (index: number, value: string) => {
        const char = value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        setError(null);
        if (char) focusNext(index);
        if (char && next.every((d) => d !== "")) handleVerify(next.join(""));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                const next = [...digits];
                next[index] = "";
                setDigits(next);
            } else focusPrev(index);
        }
        if (e.key === "ArrowLeft") focusPrev(index);
        if (e.key === "ArrowRight") focusNext(index);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((ch, i) => { next[i] = ch; });
        setDigits(next);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
        if (pasted.length === OTP_LENGTH) handleVerify(pasted);
    };

    const handleVerify = useCallback(async (otp: string) => {
        setError(null);
        try {
            const res = await verifyOtp({ email, otp }).unwrap();
            if (res.otp_valid) onSuccess();
            else throw new Error();
        } catch {
            setError("Invalid or expired OTP. Please try again.");
            setDigits(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        }
    }, [email, verifyOtp, onSuccess]);

    const handleResend = async () => {
        try {
            await sendOtp({ email }).unwrap();
            toast.success("New OTP sent");
            setCooldown(RESEND_COOLDOWN);
            setDigits(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
            onResend();
        } catch {
            toast.error("Failed to resend OTP. Try again.");
        }
    };

    const filled = digits.filter(Boolean).length;

    return (
        <div style={{ animation: "fpSlideIn 0.3s ease both" }}>
            <div className="flex flex-col items-center gap-2 text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-sm text-muted-foreground max-w-xs">
                    We sent a {OTP_LENGTH}-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>
            </div>

            <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        autoFocus={i === 0}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={cn(
                            "w-11 h-12 text-center text-lg font-bold rounded-xl border-2 bg-background",
                            "outline-none transition-all duration-150 caret-transparent",
                            "focus:border-foreground focus:scale-105",
                            digit ? "border-foreground/40 bg-muted/50" : "border-border",
                            error && "border-red-500 bg-red-500/5",
                        )}
                    />
                ))}
            </div>

            <div className="flex justify-center gap-1 mb-4">
                {digits.map((d, i) => (
                    <div key={i} className={cn("h-0.5 w-6 rounded-full transition-all duration-200",
                        d ? "bg-foreground" : "bg-border")} />
                ))}
            </div>

            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

            <Button className="w-full mb-4" disabled={filled < OTP_LENGTH || isLoading} onClick={() => handleVerify(digits.join(""))}>
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Verify OTP
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Didn't receive it?{" "}
                {cooldown > 0 ? (
                    <span className="text-muted-foreground">
                        Resend in <span className="font-mono tabular-nums text-foreground">{cooldown}s</span>
                    </span>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={isSending}
                        className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 hover:text-foreground/70 transition-colors disabled:opacity-50"
                    >
                        {isSending && <Loader className="w-3 h-3 animate-spin" />}
                        <RefreshCw className="w-3 h-3" />
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Step 3: Reset password ───────────────────────────────────────────────
const resetSchema = z.object({
    password: z
        .string()
        .min(8, "Must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

function ResetStep({ email, onSuccess }: { email: string; onSuccess: () => void }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetPassword, { isLoading }] = useForgotPasswordResetMutation();

    const form = useForm<{ password: string; confirmPassword: string }>({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const password = form.watch("password");
    const strength = getPasswordStrength(password);
    const strengthBarColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

    const onSubmit = async ({ password }: { password: string; confirmPassword: string }) => {
        try {
            await resetPassword({ email, new_password: password }).unwrap();
            toast.success("Password reset successful");
            onSuccess();
        } catch {
            toast.error("Failed to reset password. Try again.");
        }
    };

    return (
        <div style={{ animation: "fpSlideIn 0.3s ease both" }}>
            {/* Same UI as before */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    {/* New password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="!font-normal">New password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            autoFocus
                                            autoComplete="new-password"
                                            className="pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password strength meter */}
                    {password.length > 0 && (
                        <div className="space-y-2 -mt-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={cn(
                                        "h-1 flex-1 rounded-full transition-all duration-300",
                                        i <= strength.score ? strengthBarColors[strength.score] : "bg-border"
                                    )} />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    {strength.checks.map((c) => (
                                        <span key={c.label} className={cn(
                                            "text-[11px] flex items-center gap-1 transition-colors",
                                            c.pass ? "text-green-500" : "text-muted-foreground"
                                        )}>
                                            <span className="text-[10px]">{c.pass ? "✓" : "○"}</span>
                                            {c.label}
                                        </span>
                                    ))}
                                </div>
                                {strength.label && (
                                    <span className={cn("text-xs font-medium shrink-0", strength.color)}>
                                        {strength.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Confirm password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="!font-normal">Confirm password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Confirm password"
                                            autoComplete="new-password"
                                            className="pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        Update Password
                    </Button>
                </form>
            </Form>
        </div>
    );
}

// ─── Main Forgot Password Component ───────────────────────────────────────
export default function ForgotPassword() {
    const { theme } = useTheme();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    return (

        <>

            <style>{`
                @keyframes fpSlideIn {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="grid min-h-svh lg:grid-cols-2">

                {/* LEFT PANEL */}
                <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <Logo url="/" />
                    </div>

                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm">
                            {/* Back link */}
                            {step !== "success" && (
                                <Link
                                    to={AUTH_ROUTES.SIGN_IN}
                                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Back to login
                                </Link>
                            )}

                            <StepIndicator current={step} />

                            {step === "email" && (
                                <EmailStep
                                    onSuccess={(email) => {
                                        setEmail(email);
                                        setStep("otp");
                                    }}
                                />
                            )}
                            {step === "otp" && (
                                <OtpStep
                                    email={email}
                                    onSuccess={() => setStep("reset")}
                                    onResend={() => { }}
                                />
                            )}
                            {step === "reset" && (
                                <ResetStep email={email} onSuccess={() => navigate(AUTH_ROUTES.SIGN_IN)} />
                            )}
                            {step === "success" && (
                                <div className="text-center">
                                    <CheckCircle2 className="mx-auto w-12 h-12 text-green-500 mb-4" />
                                    <h2 className="text-2xl font-bold">Password updated!</h2>
                                    <p className="text-muted-foreground mt-2">You can now log in with your new password.</p>
                                    <Button className="mt-4" onClick={() => navigate(AUTH_ROUTES.SIGN_IN)}>Go to Login</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>



                {/* RIGHT PANEL */}

                <div className="relative hidden bg-muted lg:block -mt-3">
                    <div className="absolute inset-0 flex flex-col items-end justify-end pt-8 pl-8">
                        <div className="w-full max-w-3xl mx-0 pr-5">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Hi, I'm your AI-powered personal finance app, Arthium!
                            </h1>
                            <p className="mt-4 text-gray-600 dark:text-muted-foreground">
                                Arthium provides insights, monthly reports, CSV import, recurring transactions, all powered by advanced AI technology. 🚀
                            </p>
                        </div>
                        <div className="relative max-w-3xl h-full w-full overflow-hidden mt-3">
                            <img
                                src={theme === "dark" ? dashboardImgDark : dashboardImg}
                                alt="Dashboard"
                                className="absolute top-0 left-0 w-full h-full object-cover"
                                style={{ objectPosition: "left top", transform: "scale(1.2)", transformOrigin: "left top" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


{/* <div className="flex flex-col items-center justify-center min-h-screen px-4">
    <Logo />
    <StepIndicator current={step} />

    
</div> */}