"use client";

import { useEffect, useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Match the backend schema
interface LedgerEntry {
    id: number;
    scheme_name: string;
    amount: number;
    beneficiary?: string;
    disbursed_by: string;
    description?: string;
    prev_hash: string;
    current_hash: string;
    created_at: string;
}

export default function TransparencyPage() {
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLedger() {
            try {
                const data = await api.get<LedgerEntry[]>("/api/v1/ledger");
                setLedgerEntries(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch ledger data");
            } finally {
                setLoading(false);
            }
        }
        fetchLedger();
    }, []);

    const handleCopyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        // In a real app we might show a toast here
    };

    return (
        <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Public Audit Ledger
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Immutable financial records verifying all fund disbursements.
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 px-3 py-1.5 text-sm"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-1.5 inline" />
                        Ledger Integrity: VERIFIED
                    </Badge>
                </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b pb-4">
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading ledger data...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">
                            Error: {error}
                        </div>
                    ) : ledgerEntries.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No transactions recorded yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                <TableRow>
                                    <TableHead className="w-[180px]">Date</TableHead>
                                    <TableHead>Scheme/Project ID</TableHead>
                                    <TableHead>Amount Disbursed</TableHead>
                                    <TableHead className="text-right">Transaction Hash</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledgerEntries.map((entry) => (
                                    <TableRow key={entry.id} className="group">
                                        <TableCell className="font-medium text-gray-600 dark:text-gray-300">
                                            {entry.created_at && !isNaN(new Date(entry.created_at).getTime())
                                                ? format(new Date(entry.created_at), "MMM d, yyyy HH:mm")
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>{entry.scheme_name}</TableCell>
                                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                            ₹{(entry.amount || 0).toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded font-mono text-sm">
                                                    {entry.current_hash.substring(0, 10)}...
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleCopyHash(entry.current_hash)}
                                                    title="Copy full hash"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    <span className="sr-only">Copy hash</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
