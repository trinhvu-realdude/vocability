import { useEffect, useState } from "react";

export const StorageBar = () => {
    const [usedPercentage, setUsedPercent] = useState<number>();

    useEffect(() => {
        const calculateStorage = async () => {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();

                const used = estimate.usage;
                const quota = estimate.quota;

                if (used && quota) {
                    const usedMB = used / 1024 / 1024;
                    const quotaMB = quota / 1024 / 1024;
                    const usage = (used / quota) * 100;
                    setUsedPercent(usage);

                    // console.log(`Used Storage: ${usedMB} MB`);
                    // console.log(`Available Storage: ${quotaMB} MB`);
                    // console.log(`Used Storage Percentage: ${usage}%`);
                }
            }
        };
        calculateStorage();
    }, []);
    return (
        <>
            {usedPercentage && usedPercentage > 50 ? (
                <div className="d-flex align-items-center mb-4">
                    <label className="me-3">
                        <small>Used Storage</small>
                    </label>
                    <div className="progress flex-grow-1">
                        <div
                            className="progress-bar progress-bar-striped bg-success"
                            role="progressbar"
                            style={{
                                width: `${usedPercentage}%`,
                            }}
                            aria-valuenow={usedPercentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            {`${usedPercentage}%`}
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};
