import React from "react";
import { CollectionShare } from "../interfaces/model";
import "../styles/AvatarStack.css";

interface AvatarStackProps {
    shares: CollectionShare[];
    maxVisible?: number;
    size?: number; // px
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
    shares,
    maxVisible = 3,
    size = 28,
}) => {
    if (!shares || shares.length === 0) return null;

    const visible = shares.slice(0, maxVisible);
    const overflow = shares.length - maxVisible;

    return (
        <div className="avatar-stack" style={{ "--avatar-size": `${size}px` } as React.CSSProperties}>
            {visible.map((share, i) => {
                const p = share.profile;
                const initials = p
                    ? (p.display_name || p.username || "?").slice(0, 1).toUpperCase()
                    : "?";
                const title = p ? `${p.display_name || p.username} (${share.role})` : share.role;

                return p?.avatar_url ? (
                    <img
                        key={share.user_id}
                        className="avatar-item"
                        src={p.avatar_url}
                        alt={initials}
                        title={title}
                        style={{ zIndex: maxVisible - i }}
                    />
                ) : (
                    <div
                        key={share.user_id}
                        className="avatar-item avatar-initials"
                        title={title}
                        style={{ zIndex: maxVisible - i }}
                    >
                        {initials}
                    </div>
                );
            })}
            {overflow > 0 && (
                <div className="avatar-item avatar-overflow" title={`+${overflow} more`}>
                    +{overflow}
                </div>
            )}
        </div>
    );
};
