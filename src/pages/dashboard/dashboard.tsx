import styles from "./styles/dashboard.module.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "../../types/user";
import { useState, useMemo } from "react";
import UserDetails from "../../components/userDetails/userDetails";
import skeletonStyles from "../../styles/skeleton.module.scss";
import logo from "../../assets/images/logo.png";
import { IoSearchOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../context/authContext";

const UserSkeleton = () => (
    <div className={styles.userCardSkeleton}>
        <div className={`${styles.userEmailSkeleton} ${skeletonStyles.skeleton}`} />
    </div>
);

const fetchUsers = async (): Promise<User[]> => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cockpit/users`);
    return response.data;
};

const Dashboard = () => {
    const { logout } = useAuth();
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers
    });

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const renderSkeletons = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <UserSkeleton key={index} />
            ))}
        </>
    );

    return (
        <div className={styles.dashboardContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="logo" className={styles.logo} />
                </div>
                <div className={styles.sidebarContainer}>
                    <h2 className={styles.sidebarTitle}>Users</h2>

                    <div className={styles.searchContainer}>
                        <IoSearchOutline className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className={styles.userList}>
                            {renderSkeletons()}
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
                                filteredUsers.map((user) => (
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
                </div>
                <button className={styles.logoutButton} onClick={() => setShowLogoutDialog(true)}>
                    <IoLogOutOutline />
                    <span>Logout</span>
                </button>
            </aside>
            <main className={styles.mainContent}>
                <UserDetails userEmail={selectedUserEmail} />
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
