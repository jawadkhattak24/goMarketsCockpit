import styles from "./styles/userDetails.module.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User, Trade, Transaction, UserStatus } from "../../types/user";
import { IoMdRefresh } from "react-icons/io";
import { useState, useMemo } from "react";
import skeletonStyles from "../../styles/skeleton.module.scss";
import { IoMdMan } from "react-icons/io";

interface UserDetailsProps {
    userEmail: string | null;
}

interface UserDetailsResponse {
    user: User;
    trades: Trade[];
    transactions: Transaction[];
}

const fetchUserDetails = async (email: string): Promise<UserDetailsResponse> => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cockpit/users/details/${email}`);
    return response.data;
};

const UserDetailsSkeleton = () => (
    <div className={styles.userDetails}>
        <div className={styles.header}>
            <div className={`${styles.titleSkeleton} ${skeletonStyles.skeleton}`} />
            <div className={`${styles.badgeSkeleton} ${skeletonStyles.skeleton}`} />
        </div>

        <div className={styles.section}>
            <div className={`${styles.sectionTitleSkeleton} ${skeletonStyles.skeleton}`} />
            <div className={styles.infoGrid}>
                {[...Array(4)].map((_, index) => (
                    <div key={index} className={styles.infoItem}>
                        <div className={`${styles.labelSkeleton} ${skeletonStyles.skeleton}`} />
                        <div className={`${styles.valueSkeleton} ${skeletonStyles.skeleton}`} />
                    </div>
                ))}
            </div>
        </div>

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={`${styles.sectionTitleSkeleton} ${skeletonStyles.skeleton}`} />
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {[...Array(6)].map((_, index) => (
                                <th key={index}>
                                    <div className={`${styles.thSkeleton} ${skeletonStyles.skeleton}`} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(3)].map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {[...Array(6)].map((_, colIndex) => (
                                    <td key={colIndex}>
                                        <div className={`${styles.tdSkeleton} ${skeletonStyles.skeleton}`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={`${styles.sectionTitleSkeleton} ${skeletonStyles.skeleton}`} />
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {[...Array(3)].map((_, index) => (
                                <th key={index}>
                                    <div className={`${styles.thSkeleton} ${skeletonStyles.skeleton}`} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(3)].map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {[...Array(3)].map((_, colIndex) => (
                                    <td key={colIndex}>
                                        <div className={`${styles.tdSkeleton} ${skeletonStyles.skeleton}`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const UserDetails = ({ userEmail }: UserDetailsProps) => {
    const [isRefreshingTrades, setIsRefreshingTrades] = useState(false);
    const [isRefreshingTransactions, setIsRefreshingTransactions] = useState(false);
    const [showBanDialog, setShowBanDialog] = useState(false);
    const [showUnbanDialog, setShowUnbanDialog] = useState(false);
    const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['userDetails', userEmail],
        queryFn: () => fetchUserDetails(userEmail!),
        enabled: !!userEmail
    });

    const updateUserStatus = useMutation({
        mutationFn: async ({ email, status }: { email: string, status: UserStatus }) => {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/cockpit/users/status`, {
                email,
                status
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userDetails', userEmail] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const depositFunds = useMutation({
        mutationFn: async ({ email, amount }: { email: string, amount: number }) => {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/cockpit/users/deposit`, {
                email,
                amount
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userDetails', userEmail] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowAddFundsDialog(false);
            setDepositAmount("");
        }
    });

    const handleBanUser = async () => {
        if (!data?.user?.email) return;
        await updateUserStatus.mutate({
            email: data.user.email,
            status: UserStatus.BANNED
        });
        setShowBanDialog(false);
    };

    const handleUnbanUser = async () => {
        if (!data?.user?.email) return;
        await updateUserStatus.mutate({
            email: data.user.email,
            status: UserStatus.ACTIVE
        });
        setShowUnbanDialog(false);
    };

    const handleRefreshTrades = async () => {
        setIsRefreshingTrades(true);
        await refetch();
        setTimeout(() => setIsRefreshingTrades(false), 1000);
    };

    const handleRefreshTransactions = async () => {
        setIsRefreshingTransactions(true);
        await refetch();
        setTimeout(() => setIsRefreshingTransactions(false), 1000);
    };

    const handleAddFunds = async () => {
        if (!data?.user?.email || !depositAmount) return;
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) return;
        
        await depositFunds.mutate({
            email: data.user.email,
            amount
        });
    };

    const sortedData = useMemo(() => {
        if (!data) return { user: null, trades: [], transactions: [] };
        
        const sortedTrades = [...(data.trades || [])].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const sortedTransactions = [...(data.transactions || [])].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return { user: data.user, trades: sortedTrades, transactions: sortedTransactions };
    }, [data]);

    if (!userEmail) {
        return (
            <div className={styles.noSelection}>
                <p>Select a user from the sidebar to view details</p>
            </div>
        );
    }

    if (isLoading) {
        return <UserDetailsSkeleton />;
    }

    if (error) {
        return <div className={styles.error}>Error loading user details</div>;
    }

    const { user, trades, transactions } = sortedData;

    return (
        <div className={styles.userDetails}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>User Details</h2>
                    {user?.status === UserStatus.BANNED && (
                        <span className={styles.bannedBadge}>Banned</span>
                    )}
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.verificationBadge} data-status={user?.verificationStatus?.toLowerCase()}>
                        {user?.verificationStatus}
                    </div>
                    {user?.status === UserStatus.BANNED ? (
                        <button
                            className={styles.unbanButton}
                            onClick={() => setShowUnbanDialog(true)}
                            disabled={updateUserStatus.isPending}
                        >
                            <IoMdMan size={20} />
                            Unban User
                        </button>
                    ) : (
                        <button
                            className={styles.banButton}
                            onClick={() => setShowBanDialog(true)}
                            disabled={updateUserStatus.isPending}
                        >
                            <IoMdMan size={20} />
                            Ban User
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Account Information</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <label>Email</label>
                        <span>{user?.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Available Funds</label>
                        <div className={styles.fundsContainer}>
                            <span>${user?.availableFunds?.toLocaleString()}</span>
                            <button
                                className={styles.addFundsButton}
                                onClick={() => setShowAddFundsDialog(true)}
                                disabled={depositFunds.isPending}
                            >
                                Add Funds
                            </button>
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Email Verified</label>
                        <span className={styles.verificationStatus}>
                            {user?.emailVerified ? "✓ Verified" : "✗ Unverified"}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Member Since</label>
                        <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Recent Trades</h3>
                    <button 
                        className={`${styles.refreshButton} ${isRefreshingTrades ? styles.rotating : ''}`}
                        onClick={handleRefreshTrades}
                        disabled={isRefreshingTrades}
                    >
                        <IoMdRefresh size={20} />
                    </button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Pair</th>
                                <th>Direction</th>
                                <th>Lots</th>
                                <th>Price</th>
                                <th>Profit</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades?.map((trade) => (
                                <tr key={trade.id}>
                                    <td>{trade.transactionPairs}</td>
                                    <td className={styles.direction} data-direction={trade.direction.toLowerCase()}>
                                        {trade.direction}
                                    </td>
                                    <td>{trade.lots}</td>
                                    <td>${trade.currentPrice?.toFixed(2) || '-'}</td>
                                    <td className={styles.profit} data-positive={!!trade.profit && trade.profit > 0}>
                                        ${trade.profit?.toFixed(2) || '-'}
                                    </td>
                                    <td className={styles.status} data-status={trade.status.toLowerCase()}>
                                        {trade.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Recent Transactions</h3>
                    <button 
                        className={`${styles.refreshButton} ${isRefreshingTransactions ? styles.rotating : ''}`}
                        onClick={handleRefreshTransactions}
                        disabled={isRefreshingTransactions}
                    >
                        <IoMdRefresh size={20} />
                    </button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions?.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.transactionType} data-type={transaction.type.toLowerCase()}>
                                        {transaction.type}
                                    </td>
                                    <td>${transaction.quantity.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showBanDialog && (
                <div className={styles.dialogBackdrop}>
                    <div className={styles.dialog}>
                        <h3>Ban User</h3>
                        <p>Are you sure you want to ban this user?</p>
                        <p className={styles.userEmail}>{user?.email}</p>
                        <p className={styles.warningText}>
                            This action will prevent the user from accessing their account and performing any trades.
                        </p>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowBanDialog(false)}
                                disabled={updateUserStatus.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleBanUser}
                                disabled={updateUserStatus.isPending}
                            >
                                {updateUserStatus.isPending ? 'Banning...' : 'Confirm Ban'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUnbanDialog && (
                <div className={styles.dialogBackdrop}>
                    <div className={styles.dialog}>
                        <h3>Unban User</h3>
                        <p>Are you sure you want to unban this user?</p>
                        <p className={styles.userEmail}>{user?.email}</p>
                        <p className={styles.warningText}>
                            This action will restore the user's access to their account and allow them to perform trades again.
                        </p>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowUnbanDialog(false)}
                                disabled={updateUserStatus.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleUnbanUser}
                                disabled={updateUserStatus.isPending}
                            >
                                {updateUserStatus.isPending ? 'Unbanning...' : 'Confirm Unban'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddFundsDialog && (
                <div className={styles.dialogBackdrop}>
                    <div className={styles.dialog}>
                        <h3>Add Funds</h3>
                        <p>Enter the amount you want to add to the user's account</p>
                        <p className={styles.userEmail}>{user?.email}</p>
                        <div className={styles.inputContainer}>
                            <label htmlFor="amount">Amount ($)</label>
                            <input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="Enter amount"
                                className={styles.amountInput}
                            />
                        </div>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowAddFundsDialog(false);
                                    setDepositAmount("");
                                }}
                                disabled={depositFunds.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleAddFunds}
                                disabled={depositFunds.isPending || !depositAmount || parseFloat(depositAmount) <= 0}
                            >
                                {depositFunds.isPending ? 'Processing...' : 'Add Funds'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;
