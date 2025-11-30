"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const user = await login(email, password);
            if (user.onboardingComplete) {
                router.push("/dashboard");
            } else {
                router.push("/onboarding");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Plane className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Login to continue your travel planning</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/signup")}
                                className="text-primary hover:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
