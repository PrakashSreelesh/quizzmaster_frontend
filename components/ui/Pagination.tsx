import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Simple logic to show max 5 pages around current
    const visiblePages = pages.filter(p => {
        if (totalPages <= 7) return true;
        return Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages;
    });

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-white/5 bg-slate-900/40"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {visiblePages.map((page, idx) => {
                const prevPage = visiblePages[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                    <div key={page} className="flex items-center">
                        {showEllipsis && <span className="text-slate-500 px-2">...</span>}
                        <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={currentPage === page ? "" : "border-white/5 bg-slate-900/40 text-slate-400"}
                        >
                            {page}
                        </Button>
                    </div>
                );
            })}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-white/5 bg-slate-900/40"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
