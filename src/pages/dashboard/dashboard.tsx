import styles from "./styles/dashboard.module.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User, TradingPair } from "../../types/user";
import { useState, useMemo } from "react";
import UserDetails from "../../components/userDetails/userDetails";
import PairDetails from "../../components/pairDetails/pairDetails";
import skeletonStyles from "../../styles/skeleton.module.scss";
import logo from "../../assets/images/logo.png";
import { IoSearchOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../context/authContext";
import { IoTrendingUp, IoTrendingDown } from "react-icons/io5";

const UserSkeleton = () => (
    <div className={styles.userCardSkeleton}>
        <div className={`${styles.userEmailSkeleton} ${skeletonStyles.skeleton}`} />
    </div>
);

const tradingPairs: TradingPair[] = [
    {
        symbol: "XAUUSD",
        currentPrice: 2947,
        percentageChange: 0.4,
        id: 1001,
    },
    {
        symbol: "XAGUSD",
        currentPrice: 35.2,
        percentageChange: 0.4,
        id: 1002,
    },
    {
        symbol: "BTCUSD",
        currentPrice: 2947,
        percentageChange: 0.4,
        id: 1003,
    },
    {
        symbol: "LTCUSD",
        currentPrice: 143,
        percentageChange: -1.2,
        id: 1004,
    },
    {
        symbol: "USOIL",
        currentPrice: 80.2,
        percentageChange: 1.2,
        id: 1005,
    },
    {
        symbol: "UKOIL",
        currentPrice: 80.2,
        percentageChange: 1.2,
        id: 1006,
    },
    {
        symbol: "ETHUSD",
        currentPrice: 95745,
        percentageChange: 2.3,
        id: 1007,
    },
    {
        symbol: "USDJPY",
        currentPrice: 100.08,
        percentageChange: -4.2,
        id: 1008,
    },
    {
        symbol: "EURGBP",
        currentPrice: 0.86,
        percentageChange: 2.2,
        id: 1009,
    },
    {
        symbol: "NZDUSD",
        currentPrice: 1.08,
        percentageChange: 1.2,
        id: 1010,
    },
    {
        symbol: "GBPUSD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1011,
    },
    {
        symbol: "USDCHF",
        currentPrice: 0.9,
        percentageChange: 1.2,
        id: 1012,
    },
    {
        symbol: "USDCAD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1013,
    },
    {
        symbol: "EURJPY",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1014,
    },
    {
        symbol: "GBPNZD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1015,
    },
    {
        symbol: "EURCAD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1016,
    },
    {
        symbol: "GBPJPY",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1017,
    },
    {
        symbol: "EURAUD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1018,
    },
    {
        symbol: "EURUSD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1019,
    },
    {
        symbol: "NZDJPY",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1020,
    },
    {
        symbol: "CADJPY",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1021,
    },
    {
        symbol: "EURNZD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1022,
    },
    {
        symbol: "AUDJPY",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1023,
    },
    {
        symbol: "GBPAUD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1024,
    },
    {
        symbol: "AUDNZD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1025,
    },
    {
        symbol: "EURCHF",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1026,
    },
    {
        symbol: "AUDUSD",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1027,
    },
    {
        symbol: "AUS200",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1028,
    },
    {
        symbol: "ESP35",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1029,
    },
    {
        symbol: "FRA40",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1030,
    },
    {
        symbol: "SPX500",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1031,
    },
    {
        symbol: "US30",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1032,
    },
    {
        symbol: "UK100",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1033,
    },
    {
        symbol: "JPN225",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1034,
    },
    {
        symbol: "GER30",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1035,
    },
    {
        symbol: "NAS100",
        currentPrice: 1.2,
        percentageChange: 1.2,
        id: 1036,
    },
];

enum Tabs {
    Users = "users",
    Pairs = "pairs"
}

const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get(`http://localhost:3000/api/cockpit/users`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

const fetchPairs = async (): Promise<TradingPair[]> => {
    try {
        const response = await axios.get(`http://localhost:3000/api/cockpit/pairs`);
        console.log("Pairs", response.data.pairs);
        return Array.isArray(response.data.pairs) ? response.data.pairs : [];
    } catch (error) {
        console.error('Error fetching pairs:', error);
        return [];
    }
};


const Dashboard = () => {
    const { logout } = useAuth();
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
    const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
    const [userSearch, setUserSearch] = useState("");
    const [pairSearch, setPairSearch] = useState("");
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Users);

    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers
    });

    const { data: pairs = [], isLoading: pairsLoading, error: pairsError } = useQuery({
        queryKey: ['pairs'],
        queryFn: fetchPairs
    });

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.email.toLowerCase().includes(userSearch.toLowerCase())
        );
    }, [users, userSearch]);

    const filteredPairs = useMemo(() => {
        return pairs.filter(pair =>
            pair.symbol.toLowerCase().includes(pairSearch.toLowerCase())
        );
    }, [pairs, pairSearch]);

    const renderSidebarContent = () => {
        if (activeTab === Tabs.Users) {
            return (
                <>
                    <div className={styles.searchContainer}>
                        <IoSearchOutline className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className={styles.searchInput}
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                    {isLoading ? (
                        <div className={styles.userList}>
                            {[...Array(5)].map((_, index) => (
                                <UserSkeleton key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className={styles.error}>Oh oh! Looks like something went wrong.</div>
                    ) : (
                        <div className={styles.userList}>
                            {filteredUsers.length === 0 ? (
                                <div className={styles.noResults}>
                                    No users found matching your search
                                </div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={`${styles.userCard} ${user.email === selectedUserEmail ? styles.selected : ''}`}
                                        onClick={() => setSelectedUserEmail(user.email)}
                                    >
                                        <div className={styles.userInfo}>
                                            <p className={styles.userEmail}>{user.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            );
        }

        return (
            <>
                <div className={styles.searchContainer}>
                    <IoSearchOutline className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search pairs..."
                        className={styles.searchInput}
                        value={pairSearch}
                        onChange={(e) => setPairSearch(e.target.value)}
                    />
                </div>
                <div className={styles.pairList}>
                    {filteredPairs.length === 0 ? (
                        <div className={styles.noResults}>
                            No pairs found matching your search
                        </div>
                    ) : (
                        filteredPairs.map(pair => (
                            <div
                                key={pair.id}
                                className={`${styles.pairCard} ${selectedPair?.id === pair.id ? styles.selected : ''}`}
                                onClick={() => setSelectedPair(pair)}
                            >
                                <div className={styles.pairInfo}>
                                    <p className={styles.pairSymbol}>{pair.symbol}</p>
                                    {/* {pair.currentPrice && (
                                        <p className={styles.pairPrice}>
                                            ${pair.currentPrice.toLocaleString()}
                                        </p>
                                    )} */}
                                </div>
                                {/* {pair.percentageChange !== undefined && (
                                    <div
                                        className={styles.percentageChange}
                                        data-trend={pair.percentageChange > 0 ? 'up' : 'down'}
                                    >
                                        {pair.percentageChange > 0 ? (
                                            <IoTrendingUp className={styles.trendIcon} />
                                        ) : (
                                            <IoTrendingDown className={styles.trendIcon} />
                                        )}
                                        {Math.abs(pair.percentageChange)}%
                                    </div>
                                )} */}
                            </div>
                        ))
                    )}
                </div>
            </>
        );
    };

    return (
        <div className={styles.dashboardContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="logo" className={styles.logo} />
                </div>
                <div className={styles.sidebarContainer}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === Tabs.Users ? styles.active : ''}`}
                            onClick={() => {
                                setActiveTab(Tabs.Users);
                                setUserSearch('');
                                setSelectedPair(null);
                            }}
                        >
                            Users
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === Tabs.Pairs ? styles.active : ''}`}
                            onClick={() => {
                                setActiveTab(Tabs.Pairs);
                                setPairSearch('');
                                setSelectedUserEmail(null);
                            }}
                        >
                            Pairs
                        </button>
                    </div>
                    {renderSidebarContent()}
                </div>
                <button className={styles.logoutButton} onClick={() => setShowLogoutDialog(true)}>
                    <IoLogOutOutline />
                    <span>Logout</span>
                </button>
            </aside>
            <main className={styles.mainContent}>
                {activeTab === Tabs.Users ? (
                    <UserDetails userEmail={selectedUserEmail} />
                ) : (
                    <PairDetails pair={selectedPair} />
                )}
            </main>

            {showLogoutDialog && (
                <div className={styles.dialogBackdrop}>
                    <div className={styles.dialog}>
                        <div className={styles.dialogHeader}>
                            <h3>Confirm Logout</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowLogoutDialog(false)}
                                aria-label="Close dialog"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>
                        <p>Are you sure you want to log out?</p>
                        <p className={styles.warningText}>
                            You will need to log in again to access the dashboard.
                        </p>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowLogoutDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={() => {
                                    logout();
                                    setShowLogoutDialog(false);
                                }}
                            >
                                Confirm Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
