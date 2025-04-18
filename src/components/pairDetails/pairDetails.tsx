import styles from "./styles/pairDetails.module.scss";
import { TradingPair } from "../../types/user";
import { useState, useEffect } from "react";
import { IoMdRefresh, IoMdClose } from "react-icons/io";
import { IoTrendingUp, IoTrendingDown } from "react-icons/io5";
import skeletonStyles from "../../styles/skeleton.module.scss";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface PairDetailsProps {
    pair: TradingPair | null;
}

interface ControlPairData {
    id: string;
    isControlled: boolean;
    controlPercentage: number;
    controlDuration: number;
}

const updatePairControl = async (data: ControlPairData) => {
    const response = await axios.post(`http://localhost:3000/api/cockpit/pairs/control`, data);
    return response.data;
};



const PairDetailsSkeleton = () => (
    <div className={styles.pairDetails}>
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
    </div>
);

const PairDetails = ({ pair }: PairDetailsProps) => {
    // Fetch detailed info for the selected pair
    const { data: fetchedPair } = useQuery<TradingPair>({
        queryKey: ['pair', pair?.id],
        queryFn: () => axios.get(`http://localhost:3000/api/cockpit/pairs/${pair?.id}`).then(res => res.data.pair),
        enabled: !!pair?.id,
    });

    // Initialize and sync control state with fetched data
    const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
    const [showControlDialog, setShowControlDialog] = useState(false);
    const [isControlled, setIsControlled] = useState<boolean>(pair?.isControlled ?? false);
    const [controlPercentage, setControlPercentage] = useState<string>(
        pair?.controlPercentage?.toString() ?? "0"
    );
    const [controlDuration, setControlDuration] = useState<string>(
        pair?.controlDuration?.toString() ?? "0"
    );

    useEffect(() => {
        if (fetchedPair) {
            setIsControlled(fetchedPair.isControlled ?? false);
            setControlPercentage((fetchedPair.controlPercentage ?? 0).toString());
            setControlDuration((fetchedPair.controlDuration ?? 0).toString());
        }
    }, [fetchedPair]);
    const queryClient = useQueryClient();



    // const [buttonText, setButtonText] = useState("Add All Pairs");

    // const addAllPairs = async () => {
    //     const response = await axios.post(`http://localhost:3000/api/cockpit/pairs/add`);
    //     if (response.status === 200) {
    //         setButtonText("Pairs Added");
    //     } else {
    //         setButtonText("Error Adding Pairs");
    //     }
    // };



    const controlMutation = useMutation({
        mutationFn: updatePairControl,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pairs'] });
            setShowControlDialog(false);
        },
    });

    const handleRefreshPrice = async () => {
        setIsRefreshingPrice(true);
        setTimeout(() => setIsRefreshingPrice(false), 1000);
    };

    const handleControlSubmit = () => {
        if (!pair?.id) return;

        const percentage = parseFloat(controlPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) return;


        console.log("Submitting control", {
            id: pair.id.toString(),
            isControlled,
            controlPercentage: percentage,
            controlDuration: parseInt(controlDuration),
        });


        controlMutation.mutate({
            id: pair.id.toString(),
            isControlled,
            controlPercentage: percentage,
            controlDuration: parseInt(controlDuration),
        });
    };

    if (!pair) {
        return (
            <div className={styles.noSelection}>
                <p>Select a trading pair from the sidebar to view details</p>
            </div>
        );
    }

    return (
        <div className={styles.pairDetails}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>{pair.symbol}</h2>
                    <div
                        className={styles.percentageChange}
                        data-trend={pair.percentageChange && pair.percentageChange > 0 ? 'up' : 'down'}
                    >
                        {pair.percentageChange && pair.percentageChange > 0 ? (
                            <IoTrendingUp className={styles.trendIcon} />
                        ) : (
                            <IoTrendingDown className={styles.trendIcon} />
                        )}
                        {Math.abs(pair.percentageChange || 0)}%
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <button
                        className={styles.controlButton}
                        onClick={() => setShowControlDialog(true)}
                    >
                        Control
                    </button>
                    {/* <button
                        className={styles.addButton}
                        onClick={addAllPairs}
                    >
                        {buttonText}
                    </button> */}
                    <button
                        className={`${styles.refreshButton} ${isRefreshingPrice ? styles.rotating : ''}`}
                        onClick={handleRefreshPrice}
                        disabled={isRefreshingPrice}
                    >
                        <IoMdRefresh size={20} />
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Pair Control Details</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <label>Status</label>
                        <span>{isControlled ? 'Controlled' : 'Not Controlled'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Control Percentage (%)</label>
                        <span>{controlPercentage}%</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Control Duration (Minutes)</label>
                        <span>{controlDuration}</span>
                    </div>
                </div>
            </div>

            {showControlDialog && (
                <div className={styles.dialogBackdrop}>
                    <div className={styles.dialog}>
                        <div className={styles.dialogHeader}>
                            <h3>Control Pair</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowControlDialog(false)}
                                aria-label="Close dialog"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>
                        <div className={styles.dialogContent}>
                            <p className={styles.pairSymbol}>{pair.symbol}</p>

                            <div className={styles.controlForm}>
                                <div className={styles.controlSwitch}>
                                    <label>Enable Control</label>
                                    <input
                                        type="checkbox"
                                        checked={isControlled}
                                        onChange={(e) => setIsControlled(e.target.checked)}
                                    />
                                </div>

                                <div className={styles.controlInput}>
                                    <label htmlFor="percentage">Control Percentage (%)</label>
                                    <input
                                        id="percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={controlPercentage}
                                        onChange={(e) => setControlPercentage(e.target.value)}
                                        disabled={!isControlled}
                                        className={styles.percentageInput}
                                    />
                                </div>
                                <div className={styles.controlInput}>
                                    <label htmlFor="percentage">Control Duration (Minutes)</label>
                                    <input
                                        id="duration"
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="1"
                                        value={controlDuration}
                                        onChange={(e) => setControlDuration(e.target.value)}
                                        disabled={!isControlled}
                                        className={styles.percentageInput}
                                    />
                                </div>

                                {parseFloat(controlPercentage) > 100 && (
                                    <p className={styles.errorText}>
                                        Percentage cannot exceed 100%
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowControlDialog(false)}
                                disabled={controlMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleControlSubmit}
                                disabled={
                                    controlMutation.isPending ||
                                    parseFloat(controlPercentage) > 100 ||
                                    parseFloat(controlPercentage) < 0 ||
                                    isNaN(parseFloat(controlPercentage))
                                }
                            >
                                {controlMutation.isPending ? 'Updating...' : 'Update Control'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PairDetails;
