"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Plus, Trash2, CheckCircle2, Circle, HelpCircle, X, Save, Type, CheckSquare, Hash, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { Question, Option } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

interface QuestionEditorProps {
    question?: Partial<Question>;
    onSave: (question: Partial<Question>) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

export function QuestionEditor({ question, onSave, onCancel, isSaving }: QuestionEditorProps) {
    const [text, setText] = useState(question?.text || "");
    const [type, setType] = useState<Question['question_type']>(question?.question_type || "multiple_choice");
    const [points, setPoints] = useState(question?.points || 1);
    const [options, setOptions] = useState<Option[]>(question?.options || []);
    const { error: toastError } = useToast();

    const handleAddOption = () => {
        if (type === 'short_answer') {
            setOptions([...options, { text: "" }]);
        } else {
            const newId = String.fromCharCode(97 + options.length).toLowerCase();
            setOptions([...options, { id: newId, text: "", is_correct: false }]);
        }
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOptionText = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const toggleOptionCorrect = (index: number) => {
        const newOptions = options.map((opt, i) => {
            if (type === 'multiple_choice' || type === 'true_false') {
                return { ...opt, is_correct: i === index };
            }
            return opt;
        });
        setOptions(newOptions);
    };

    // Ensure initial options for types
    useState(() => {
        if (options.length === 0) {
            if (type === 'true_false') {
                setOptions([
                    { id: 'true', text: 'True', is_correct: true },
                    { id: 'false', text: 'False', is_correct: false }
                ]);
            } else if (type === 'multiple_choice') {
                setOptions([
                    { id: 'a', text: '', is_correct: true },
                    { id: 'b', text: '', is_correct: false }
                ]);
            } else if (type === 'short_answer') {
                setOptions([{ text: '' }]);
            }
        }
    });

    const validate = () => {
        if (!text.trim()) return "Question text is required";
        if (options.length === 0) return "At least one option/answer is required";
        if (type !== 'short_answer' && !options.some(opt => opt.is_correct)) return "Please mark one option as correct";
        if (options.some(opt => !opt.text.trim())) return "All options must have text";
        return "";
    };

    const handleSave = async () => {
        const err = validate();
        if (err) {
            toastError(err);
            return;
        }
        await onSave({ text, question_type: type, points, options });
    };

    return (
        <Card className="border-violet-500/30 bg-slate-900/60 shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-slate-800/20">
                <div>
                    <CardTitle className="text-lg">{question?.id ? "Edit Question" : "New Question"}</CardTitle>
                    <CardDescription>Configure your question and scoring</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Text</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-border bg-slate-950/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all text-white"
                            placeholder="Enter your question here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Type</label>
                            <div className="flex bg-slate-950/50 p-1 rounded-lg border border-white/5">
                                <TypeButton
                                    active={type === 'multiple_choice'}
                                    onClick={() => setType('multiple_choice')}
                                    icon={<CheckSquare className="h-3.5 w-3.5" />}
                                    label="MCQ"
                                />
                                <TypeButton
                                    active={type === 'true_false'}
                                    onClick={() => {
                                        setType('true_false');
                                        setOptions([
                                            { id: 'true', text: 'True', is_correct: true },
                                            { id: 'false', text: 'False', is_correct: false }
                                        ]);
                                    }}
                                    icon={<Hash className="h-3.5 w-3.5" />}
                                    label="T/F"
                                />
                                <TypeButton
                                    active={type === 'short_answer'}
                                    onClick={() => setType('short_answer')}
                                    icon={<Type className="h-3.5 w-3.5" />}
                                    label="Short"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Points</label>
                            <Input
                                type="number"
                                min={0.5}
                                step={0.5}
                                value={points}
                                onChange={(e) => setPoints(parseFloat(e.target.value))}
                                className="h-9 bg-slate-950/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {type === 'short_answer' ? "Accepted Answers" : "Options"}
                        </label>
                        {type !== 'true_false' && (
                            <Button type="button" variant="ghost" size="sm" onClick={handleAddOption} className="h-7 text-[10px] text-violet-400 hover:text-violet-300">
                                <Plus className="h-3 w-3 mr-1" /> Add Option
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 group/opt">
                                {type !== 'short_answer' && (
                                    <button
                                        type="button"
                                        onClick={() => toggleOptionCorrect(index)}
                                        className={cn(
                                            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            option.is_correct ? "border-green-500 bg-green-500" : "border-slate-700 hover:border-slate-500"
                                        )}
                                    >
                                        {option.is_correct && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    </button>
                                )}

                                <div className="flex-grow flex items-center bg-slate-950/30 border border-white/5 rounded-lg overflow-hidden transition-all focus-within:border-violet-500/50 focus-within:bg-slate-950/60">
                                    <span className="bg-slate-800/50 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase border-r border-white/5">
                                        {type === 'short_answer' ? (index + 1) : option.id}
                                    </span>
                                    <input
                                        className="flex-grow bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                                        value={option.text}
                                        onChange={(e) => updateOptionText(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        disabled={type === 'true_false'}
                                    />
                                </div>

                                {type !== 'true_false' && options.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveOption(index)}
                                        className="h-8 w-8 text-slate-600 hover:text-red-400 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {type !== 'short_answer' && (
                        <p className="text-[10px] text-slate-500 text-center italic">Tip: Click the circle to mark as correct</p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="border-t border-white/5 bg-slate-800/20 pt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-500">
                    {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Question
                </Button>
            </CardFooter>
        </Card>
    );
}

function TypeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-[10px] font-bold transition-all",
                active ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-500 hover:text-slate-300"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
