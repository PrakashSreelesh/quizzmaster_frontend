"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Tag as TagIcon, ChevronDown } from "lucide-react";
import { Input } from "./Input";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    disabled?: boolean;
}

export function TagInput({
    tags,
    onTagsChange,
    suggestions = [],
    placeholder = "Add category...",
    disabled = false,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = suggestions.filter(
        (s) =>
            !tags.includes(s) &&
            s.toLowerCase().includes(inputValue.toLowerCase())
    );

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onTagsChange([...tags, trimmed]);
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter((t) => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className={cn(
                "flex flex-wrap items-center gap-2 p-2 min-h-[3rem] bg-slate-900/50 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 transition-all",
                disabled && "opacity-50 cursor-not-allowed"
            )}>
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-md border border-violet-500/30 animate-in zoom-in-95 duration-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            disabled={disabled}
                            className="bg-violet-500/20 hover:bg-violet-500/40 rounded p-0.5 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    disabled={disabled}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 min-w-[120px]"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                        {filteredSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-violet-500/20 hover:text-white rounded-md transition-colors flex items-center gap-2"
                            >
                                <TagIcon className="h-3 w-3 text-violet-500" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
