import { useEffect } from "react";
import "../styles/Toast.css";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    onClose,
    duration = 3000,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return "fa-check-circle";
            case "error":
                return "fa-exclamation-circle";
            case "warning":
                return "fa-exclamation-triangle";
            case "info":
                return "fa-info-circle";
            default:
                return "fa-info-circle";
        }
    };

    return (
        <div className={`toast-notification toast-${type}`}>
            <div className="toast-content">
                <i className={`fas ${getIcon()} toast-icon`}></i>
                <span className="toast-message">{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                <i className="fas fa-times"></i>
            </button>
            <div className="toast-progress"></div>
        </div>
    );
};
