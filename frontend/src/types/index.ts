/* ── DigiGram Pro — Shared TypeScript Interfaces ── */

// ── Auth ──────────────────────────────────────────
export type UserRole = "CITIZEN" | "OFFICIAL" | "ADMIN";

export interface User {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    role: UserRole;
    village?: string;
    district?: string;
    is_active: boolean;
    created_at: string;
}

/** JWT payload shape (decoded client-side) */
export interface JwtPayload {
    sub: string;
    role: UserRole;
    exp: number;
    iat?: number;
}

/** Login endpoint returns only an access_token */
export interface TokenResponse {
    access_token: string;
    token_type: string;
}

/** Register endpoint returns user + token */
export interface RegisterResponse {
    user: User;
    access_token: string;
    token_type: string;
}

export interface LoginRequest {
    phone: string;
    password: string;
}

export interface RegisterRequest {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    role: UserRole;
    village?: string;
    district?: string;
}

// ── Grievances ───────────────────────────────────
export type GrievanceStatus =
    | "SUBMITTED"
    | "ACKNOWLEDGED"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

export interface Grievance {
    id: string;
    citizen_id: string;
    assigned_to?: string;
    title: string;
    description: string;
    category: string;
    status: GrievanceStatus;
    latitude?: number;
    longitude?: number;
    address?: string;
    photo_url?: string;
    created_at: string;
    updated_at: string;
}

export interface GrievanceTimelineEntry {
    id: string;
    grievance_id: string;
    changed_by: string;
    old_status?: string;
    new_status: string;
    note?: string;
    created_at: string;
}

export interface CreateGrievanceRequest {
    title: string;
    description: string;
    category: string;
    latitude?: number;
    longitude?: number;
    photo?: File;
}

// ── Audit Ledger ─────────────────────────────────
export interface LedgerEntry {
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

export interface CreateLedgerRequest {
    scheme_name: string;
    amount: number;
    beneficiary?: string;
    description?: string;
}

export interface LedgerVerifyResult {
    valid: boolean;
    total_entries: number;
    tampered_entry_id?: number;
    message: string;
}

// ── AI Verification ──────────────────────────────
export interface AIVerification {
    id: string;
    grievance_id: string;
    uploaded_by: string;
    image_url: string;
    ai_verdict?: string;
    confidence?: number;
    created_at: string;
}

// ── API Response Wrappers ────────────────────────
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
}
