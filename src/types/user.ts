export enum VerificationStatus {
    UNVERIFIED = "UNVERIFIED",
    AUDITING = "AUDITING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    BANNED = "BANNED"
}

export enum TradeDirection {
    BUY = "BUY",
    SELL = "SELL"
}

export enum TradeStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CANCELLED = "CANCELLED"
}

export enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    MARGIN = "MARGIN",
    FEE = "FEE",
    LIQUIDATION = "LIQUIDATION"
}

export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    availableFunds: number;
    verificationStatus: VerificationStatus;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    status: UserStatus;
}

export interface Trade {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    transactionPairs: string;
    reservationNumber: string;
    direction: TradeDirection;
    lots: number;
    lowerUnitPrice: number;
    currentPrice?: number;
    handlingFee: number;
    margin?: number;
    profit?: number;
    openTime?: string;
    closeTime?: string;
    status: TradeStatus;
}

export interface Transaction {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    quantity: number;
    type: TransactionType;
} 