/* ── DigiGram Pro — Register Page ── */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    UserPlus,
    Eye,
    EyeOff,
    ShieldCheck,
    User,
    Building2,
} from "lucide-react";
import type { UserRole } from "@/types";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<UserRole>("CITIZEN");
    const [village, setVillage] = useState("");
    const [district, setDistrict] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await register({
                full_name: fullName,
                phone,
                email: email || undefined,
                password,
                role,
                village: village || undefined,
                district: district || undefined,
            });
            router.push("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-8">
            {/* Animated background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse [animation-delay:1s]" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-sky-500/5 blur-3xl animate-pulse [animation-delay:2s]" />
            </div>

            <div className="w-full max-w-lg mx-4 relative z-10">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 mb-4 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Join DigiGram Pro
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Create your account to get started
                    </p>
                </div>

                {/* Register Card */}
                <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/40">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl text-white">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Fill in your details below to register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Alert */}
                            {error && (
                                <div
                                    id="register-error"
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="full_name"
                                    className="text-zinc-300 text-sm font-medium"
                                >
                                    Full Name
                                </Label>
                                <Input
                                    id="full_name"
                                    type="text"
                                    placeholder="Raju Kumar"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    required
                                    minLength={2}
                                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-zinc-300 text-sm font-medium"
                                >
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                />
                            </div>

                            {/* Email (Optional) */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-zinc-300 text-sm font-medium"
                                >
                                    Email{" "}
                                    <span className="text-zinc-500">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="raju@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="role"
                                    className="text-zinc-300 text-sm font-medium"
                                >
                                    Role
                                </Label>
                                <Select
                                    value={role}
                                    onValueChange={(v) =>
                                        setRole(v as UserRole)
                                    }
                                >
                                    <SelectTrigger
                                        id="role"
                                        className="bg-zinc-800/50 border-zinc-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                    >
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                        <SelectItem
                                            value="CITIZEN"
                                            className="text-zinc-200 focus:bg-zinc-700 focus:text-white"
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-400" />
                                                <span>Citizen</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value="OFFICIAL"
                                            className="text-zinc-200 focus:bg-zinc-700 focus:text-white"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-sky-400" />
                                                <span>Government Official</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-zinc-500">
                                    {role === "CITIZEN"
                                        ? "Report grievances and track their resolution."
                                        : "Manage and resolve citizen grievances."}
                                </p>
                            </div>

                            {/* Village & District — side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="village"
                                        className="text-zinc-300 text-sm font-medium"
                                    >
                                        Village{" "}
                                        <span className="text-zinc-500">
                                            (opt.)
                                        </span>
                                    </Label>
                                    <Input
                                        id="village"
                                        type="text"
                                        placeholder="Koraput"
                                        value={village}
                                        onChange={(e) =>
                                            setVillage(e.target.value)
                                        }
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="district"
                                        className="text-zinc-300 text-sm font-medium"
                                    >
                                        District{" "}
                                        <span className="text-zinc-500">
                                            (opt.)
                                        </span>
                                    </Label>
                                    <Input
                                        id="district"
                                        type="text"
                                        placeholder="Koraput"
                                        value={district}
                                        onChange={(e) =>
                                            setDistrict(e.target.value)
                                        }
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-zinc-300 text-sm font-medium"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        minLength={6}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirm_password"
                                    className="text-zinc-300 text-sm font-medium"
                                >
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirm_password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                id="register-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all duration-200 mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <UserPlus className="w-4 h-4 mr-2" />
                                )}
                                {loading ? "Creating account…" : "Create Account"}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center text-sm text-zinc-400">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-zinc-600 mt-6">
                    Secured by end-to-end encryption · DigiGram Pro v1.0
                </p>
            </div>
        </div>
    );
}
