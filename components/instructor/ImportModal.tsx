"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Download, Upload, X, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, BarChart3, TrendingUp, Info, CheckSquare } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface ImportModalProps {
    onClose: () => void;
    onComplete: (quizId: string) => void;
}

interface JobStatus {
    id: string;
    quiz_id: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    total: number;
    completed: number;
    results: {
        total: number;
        mcq: number;
        tf: number;
        short: number;
        failed: number;
        errors: string[];
    };
}

export function ImportModal({ onClose, onComplete }: ImportModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<JobStatus | null>(null);
    const { success, error: toastError } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Polling Interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (jobId && (!status || status.status === 'processing')) {
            interval = setInterval(async () => {
                try {
                    const response = await api.get(`/quizzes/import/status/${jobId}`);
                    setStatus(response.data);
                    if (response.data.status === 'completed') {
                        clearInterval(interval);
                        success("Quiz generated successfully!");
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [jobId, status, success]);

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/quizzes/import/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'quiz_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toastError("Failed to download template");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
            } else {
                toastError("Please select an Excel file (.xlsx or .xls)");
            }
        }
    };

    const handleUpload = async () => {
        if (!title.trim()) {
            toastError("Please enter a quiz title");
            return;
        }
        if (!file) {
            toastError("Please select a file to upload");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            const response = await api.post('/quizzes/import', formData, {
                params: { title, description } // Also send as params as expected by the backend currently
            });
            setJobId(response.data.job_id);
            setIsUploading(false);
        } catch (err: any) {
            toastError(err.response?.data?.detail || "Upload failed");
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
            setFile(droppedFile);
        } else {
            toastError("Please select an Excel file (.xlsx or .xls)");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className={cn(
                "w-full max-w-xl border-violet-500/30 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300",
                status?.status === 'completed' ? "max-w-2xl" : "max-w-xl"
            )}>
                <CardHeader className="border-b border-white/5 relative">
                    <CardTitle className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-5 w-5 text-violet-400" />
                        <span>Import from Excel</span>
                    </CardTitle>
                    <CardDescription>Upload an Excel file to generate your quiz automatically</CardDescription>
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {!jobId ? (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quiz Title</label>
                                    <input
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                        placeholder="e.g., Biology Midterm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (Optional)</label>
                                    <textarea
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none transition-all min-h-[80px]"
                                        placeholder="Enter quiz description..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all",
                                    isDragging ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-violet-500/50 hover:bg-white/5",
                                    file ? "border-green-500/50 bg-green-500/5" : ""
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                />
                                {file ? (
                                    <>
                                        <div className="bg-green-500/20 p-3 rounded-full">
                                            <FileSpreadsheet className="h-8 w-8 text-green-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-white">{file.name}</p>
                                            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-violet-500/20 p-3 rounded-full">
                                            <Upload className="h-8 w-8 text-violet-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">Click to upload or drag & drop</p>
                                            <p className="text-xs text-slate-400">Supported: Excel (.xlsx, .xls)</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-dashed border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                                onClick={handleDownloadTemplate}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Excel Template
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8 py-4">
                            {status?.status === 'processing' ? (
                                <div className="space-y-6 text-center">
                                    <div className="relative inline-block">
                                        <svg className="h-32 w-32 -rotate-90 transform">
                                            <circle
                                                className="text-slate-800"
                                                strokeWidth="8"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="58"
                                                cx="64"
                                                cy="64"
                                            />
                                            <circle
                                                className="text-violet-500 transition-all duration-500 ease-out"
                                                strokeWidth="8"
                                                strokeDasharray={364.42}
                                                strokeDashoffset={364.42 - (364.42 * (status.progress || 0)) / 100}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="58"
                                                cx="64"
                                                cy="64"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-white">{status.progress}%</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase">Processing</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium text-white">Generating Quiz Questions</h3>
                                        <p className="text-sm text-slate-400">
                                            Processed {status.completed} of {status.total} questions...
                                        </p>
                                    </div>
                                </div>
                            ) : status?.status === 'completed' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-green-500/20 p-2 rounded-lg">
                                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Generation Complete!</h3>
                                                <p className="text-sm text-slate-400">Successfully processed the Excel file.</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => status.quiz_id && onComplete(status.quiz_id)}
                                            className="bg-green-600 hover:bg-green-500"
                                        >
                                            View Quiz
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <StatCard icon={<BarChart3 className="text-blue-400" />} label="Total" value={status.results.total} />
                                        <StatCard icon={<CheckSquare className="text-violet-400" />} label="MCQ" value={status.results.mcq} />
                                        <StatCard icon={<Info className="text-orange-400" />} label="T/F" value={status.results.tf} />
                                        <StatCard icon={<TrendingUp className="text-emerald-400" />} label="Short" value={status.results.short} />
                                    </div>

                                    {status.results.failed > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center text-red-400 space-x-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-bold uppercase tracking-wider">Failed Questions: {status.results.failed}</span>
                                            </div>
                                            <ul className="space-y-1">
                                                {status.results.errors.map((err, i) => (
                                                    <li key={i} className="text-xs text-red-300/70 pl-2 border-l border-red-500/30">
                                                        {err}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto mb-4" />
                                    <p>Initializing import...</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                {!jobId && (
                    <CardFooter className="border-t border-white/5 bg-slate-800/20 pt-4 flex justify-end space-x-3">
                        <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!file || !title.trim() || isUploading}
                            className="bg-violet-600 hover:bg-violet-500 min-w-[120px]"
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                            Generate Quiz
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
    return (
        <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl text-center">
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{label}</p>
        </div>
    );
}
