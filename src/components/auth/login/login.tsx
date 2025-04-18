import { useState } from "react";
import styles from "./styles/login.module.scss";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
// import { useNotification } from "../../../context/notificationContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Login = () => {


    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [password, setPassword] = useState("");
    // const { showNotification, isLoading, setIsLoading } = useNotification();

    const { login } = useAuth();
    const navigate = useNavigate();
    console.log("Login", login);


    //   const handleSendVerification = () => {
    //     // Add verification code sending logic here
    //   };

    const handleLogin = async () => {
        // setIsLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:3000/api/cockpit/login`,
                {
                    email,
                    password,
                }
            );
            // const response = await axios.post(
            //     `${import.meta.env.VITE_API_URL}/api/cockpit/login`,
            //     {
            //         email,
            //         password,
            //     }
            // );
            console.log("User logged in", response.data);
            if (response.status === 200) {

                console.log("Login Function", login);
                login(response.data.token);
                // setIsLoading(false);
                navigate("/");
                // showNotification("Logged in successfully", "success");
            }
        } catch (error) {
            console.error(error);
            // showNotification("Login failed", "error");
            // setIsLoading(false);
        }
    };

    return (
        <div className={styles.registerDialogOverlay}>
            <div className={styles.loginDialog}>
                <header className={styles.header}>
                    <div className={styles.headerText}>Login to GoMarkets</div>

                </header>

                <div>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputLabel}>Email</div>
                        <div className={styles.baseInput}>
                            <input
                                type="email"
                                placeholder="Please enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>


                    <div className={styles.inputContainer}>
                        <div className={styles.inputLabel}>Password</div>
                        <div className={styles.baseInput}>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Please enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        right: "15px",
                                        fontSize: "1.2rem",
                                        color: "#0165fa",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.linksContainer}>
                        <div
                            onClick={() => {
                                navigate("/register");
                            }}
                            className={styles.link}
                        >
                            New User? Join Now
                        </div>
                        <div
                            className={styles.link}
                            onClick={() => { navigate("/forgot-password") }}
                        >
                            Forgot password?
                        </div>
                    </div>

                    <button
                        // disabled={isLoading}
                        className={`${styles.registerButton}`}
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
