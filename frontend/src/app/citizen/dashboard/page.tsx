"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { api } from "@/lib/api";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const grievanceSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
    description: z.string().min(20, "Please provide more details (at least 20 characters)."),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

type GrievanceFormValues = z.infer<typeof grievanceSchema>;

export default function CitizenDashboard() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const form = useForm<GrievanceFormValues>({
        resolver: zodResolver(grievanceSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            latitude: undefined,
            longitude: undefined,
        },
    });

    const onSubmit = async (data: GrievanceFormValues) => {
        setSubmitError("");
        setSuccessMessage("");
        try {
            // Backend schema requires a 'category' field. Adding a default one here
            const payload = {
                ...data,
                category: "General",
            };
            const response = await api.post("/api/v1/grievances", payload);

            toast.success("Grievance submitted successfully!");
            form.reset();
        } catch (err: any) {
            const errorMessage = err.message || "An unexpected error occurred.";
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login"); // Need to ensure /login exists, but we know it does from earlier
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setSubmitError("Geolocation is not supported by your browser");
            return;
        }

        form.setValue("location", "Fetching location...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue("latitude", position.coords.latitude);
                form.setValue("longitude", position.coords.longitude);
                form.setValue("location", `📍 Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
            },
            (error) => {
                setSubmitError("Unable to retrieve your location. Please check your permissions.");
                form.setValue("location", "");
            }
        );
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col items-center justify-center p-4 selection:bg-teal-500/30">
            <div className="absolute top-4 right-4">
                <Button variant={"outline"} onClick={handleLogout} className="text-zinc-950">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>

            <div className="w-full max-w-2xl relative">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-teal-500 via-blue-500 to-purple-600 opacity-20 blur-xl"></div>

                <Card className="relative bg-neutral-900/80 backdrop-blur-xl border-neutral-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                            Submit a Grievance
                        </CardTitle>
                        <CardDescription className="text-neutral-400 text-lg">
                            Report issues in your Gram Panchayat for official review.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {submitError && (
                                    <div className="p-3 rounded-md bg-red-900/30 text-red-400 border border-red-800/50 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="p-3 rounded-md bg-teal-900/30 text-teal-400 border border-teal-800/50 text-sm">
                                        {successMessage}
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-neutral-300">Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Brief summary of the issue..."
                                                    className="bg-neutral-950/50 border-neutral-800 focus-visible:ring-teal-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400/90" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-neutral-300">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide detailed information about the grievance..."
                                                    className="bg-neutral-950/50 border-neutral-800 focus-visible:ring-teal-500 min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400/90" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-neutral-300">Location (Optional)</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Ward 4, Near Water Tank"
                                                        className="bg-neutral-950/50 border-neutral-800 focus-visible:ring-teal-500"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleGetLocation}
                                                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-0 whitespace-nowrap"
                                                >
                                                    Use My Location
                                                </Button>
                                            </div>
                                            <FormMessage className="text-red-400/90" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white border-0 shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98]"
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Grievance"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
