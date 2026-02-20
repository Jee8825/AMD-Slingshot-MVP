"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { LogOut, RefreshCw, AlertCircle, Upload, CheckCircle2, Loader2, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";

// Dynamically import the map to avoid SSR issues with Leaflet
const GrievanceMap = dynamic(() => import("@/components/GrievanceMap"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/20 border border-neutral-800 rounded-lg">
            <RefreshCw className="h-8 w-8 animate-spin text-teal-500 mb-4" />
            <p className="text-neutral-400">Loading Map Component...</p>
        </div>
    ),
});

interface Project {
    id: number;
    title: string;
    description: string;
    allocated_budget: number;
    disbursed_amount: number;
    status: string;
    start_date: string;
    end_date?: string;
    confidence_score?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const verificationSchema = z.object({
    proofImage: z
        .any()
        .refine((files) => files?.length === 1, "Please select an image.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        ),
});
type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function OfficialDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "map">("table");

    // Verification Modal State
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ status: string; confidence: number } | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<VerificationFormValues>({
        resolver: zodResolver(verificationSchema),
    });

    const openVerificationModal = (id: number) => {
        setSelectedProjectId(id);
        setVerificationResult(null);
        reset();
        setIsModalOpen(true);
    };

    const onSubmitVerification = async (data: VerificationFormValues) => {
        if (!selectedProjectId) return;

        setIsVerifying(true);
        setVerificationResult(null);
        setError(""); // Clear previous global errors, could also use a local modal error but global is fine or local is better.

        try {
            const formData = new FormData();
            formData.append("file", data.proofImage[0]);
            formData.append("status", "Completed");

            const response = await api.put<Project>(`/api/v1/projects/${selectedProjectId}`, formData);

            toast.success("Project verification successful!");
            setVerificationResult({
                status: "Success",
                confidence: response.confidence_score || 0
            });

            loadProjects();
        } catch (err: any) {
            const errorMessage = err.message || "Verification failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
            setIsModalOpen(false); // Close modal on error to show global error
        } finally {
            setIsVerifying(false);
        }
    };

    const loadProjects = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await api.get<Project[]>("/api/v1/projects");
            setProjects(data);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    // Utility to format to Indian Rupees
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6 md:p-12 selection:bg-teal-500/30">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                        Official Dashboard
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        Manage and oversee active development projects.
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="flex bg-neutral-900/80 rounded-md border border-neutral-800 p-1 mr-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 py-1 h-8 rounded-sm text-sm font-medium transition-colors ${viewMode === "table" ? "bg-neutral-800 text-teal-400 shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
                            onClick={() => setViewMode("table")}
                        >
                            <List className="mr-2 h-4 w-4" />
                            Table
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 py-1 h-8 rounded-sm text-sm font-medium transition-colors ${viewMode === "map" ? "bg-neutral-800 text-teal-400 shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
                            onClick={() => setViewMode("map")}
                        >
                            <Map className="mr-2 h-4 w-4" />
                            Map
                        </Button>
                    </div>

                    <Button variant="outline" onClick={loadProjects} disabled={loading} className="text-zinc-950 bg-neutral-100 hover:bg-white border-transparent">
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="bg-red-900/80 hover:bg-red-900 border border-red-800 text-red-100 text-zinc-950">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            <Card className="bg-neutral-900/80 border-neutral-800 shadow-2xl backdrop-blur-xl mb-8 border-t-teal-500 border-t-4">
                <CardHeader>
                    <CardTitle className="text-xl">Project Portfolio</CardTitle>
                    <CardDescription className="text-neutral-400">
                        Overview of all ongoing and completed projects in the Gram Panchayat.
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    {error && (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-900/30 text-red-400 border border-red-800/50 mb-6 font-medium">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {loading && viewMode === "table" ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                            <RefreshCw className="h-8 w-8 animate-spin mb-4 text-teal-500" />
                            <p>Loading projects data...</p>
                        </div>
                    ) : viewMode === "map" ? (
                        <GrievanceMap />
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                            <p className="text-neutral-400 text-lg">No projects found.</p>
                            <p className="text-neutral-500 text-sm mt-1">Create a new project to get started.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-neutral-800 overflow-hidden">
                            <Table>
                                <TableCaption className="text-neutral-500 pb-4">
                                    A list of your Gram Panchayat projects.
                                </TableCaption>
                                <TableHeader className="bg-neutral-950/80">
                                    <TableRow className="border-neutral-800 hover:bg-neutral-900/50 tracking-wider text-xs uppercase text-neutral-400 font-semibold">
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead className="w-[200px]">Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Budget</TableHead>
                                        <TableHead className="text-right">Disbursed</TableHead>
                                        <TableHead className="text-right">Progress</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((project) => {
                                        const progress = project.allocated_budget > 0
                                            ? Math.round((project.disbursed_amount / project.allocated_budget) * 100)
                                            : 0;

                                        return (
                                            <TableRow key={project.id} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                                                <TableCell className="font-medium text-neutral-300">#{project.id}</TableCell>
                                                <TableCell>
                                                    <p className="font-semibold text-neutral-200">{project.title}</p>
                                                    <p className="text-xs text-neutral-500 line-clamp-1">{project.description}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${project.status.toLowerCase() === 'completed' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                                                            project.status.toLowerCase() === 'in progress' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                                                                'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>
                                                        {project.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-neutral-300">
                                                    {formatCurrency(project.allocated_budget)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-teal-400">
                                                    {formatCurrency(project.disbursed_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-neutral-300">{progress}%</span>
                                                            <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-teal-500'}`}
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        {project.status.toLowerCase() === 'in progress' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-2 text-xs border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300"
                                                                onClick={() => openVerificationModal(project.id)}
                                                            >
                                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                Complete
                                                            </Button>
                                                        )}
                                                        {project.status.toLowerCase() === 'completed' && project.confidence_score !== undefined && (
                                                            <Badge variant="outline" className="h-7 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 whitespace-nowrap">
                                                                AI: {project.confidence_score.toFixed(1)}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Verification Modal */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open && !isVerifying) setIsModalOpen(false);
            }}>
                <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-neutral-50 shadow-2xl backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">AI Project Verification</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Upload photographic proof of completion. Our AI will verify the image to confirm the task is complete.
                        </DialogDescription>
                    </DialogHeader>

                    {!verificationResult ? (
                        <form onSubmit={handleSubmit(onSubmitVerification)} className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="proofImage" className="text-neutral-300">Completion Proof Image</Label>
                                <Input
                                    id="proofImage"
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp"
                                    className="bg-neutral-950/50 border-neutral-800 text-neutral-300 file:text-teal-400 file:bg-teal-500/10 file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 cursor-pointer"
                                    disabled={isVerifying}
                                    {...register("proofImage")}
                                />
                                {errors.proofImage && (
                                    <p className="text-sm text-red-500 mt-1">{errors.proofImage.message as string}</p>
                                )}
                            </div>

                            <DialogFooter className="sm:justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isVerifying}
                                    className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="bg-teal-600 hover:bg-teal-500 text-white min-w-[120px]"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Submit Proof
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-2" />
                            <h3 className="text-xl font-medium text-emerald-400">Verification Successful!</h3>
                            <p className="text-neutral-300">
                                The AI has successfully verified the project completion.
                            </p>
                            <Badge className="px-4 py-2 mt-4 text-sm bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                AI Confidence Score: {verificationResult.confidence.toFixed(1)}%
                            </Badge>

                            <Button
                                className="mt-6 w-full bg-neutral-800 hover:bg-neutral-700 text-white"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close & Refresh
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
