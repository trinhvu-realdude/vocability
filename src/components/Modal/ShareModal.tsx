import React, { useState, useEffect, useRef, useCallback } from "react";
import { Collection, CollectionShare, Profile, ShareRole } from "../../interfaces/model";
import {
    searchUsers,
    getSharesForCollection,
    upsertShare,
    removeShare,
} from "../../services/ShareService";
import { ToastType } from "../Toast";
import "../../styles/AddWordModal.css";
import "../../styles/ShareModal.css";

interface ShareModalProps {
    collection: Collection;
    onClose: () => void;
    onShowToast?: (message: string, type: ToastType) => void;
}

const ROLE_OPTIONS: { value: ShareRole; label: string; description: string }[] = [
    { value: 'viewer', label: 'Viewer', description: 'Can only view' },
    { value: 'editor', label: 'Editor', description: 'Can view & edit words' },
];

export const ShareModal: React.FC<ShareModalProps> = ({ collection, onClose, onShowToast }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [shares, setShares] = useState<CollectionShare[]>([]);
    const [pendingChanges, setPendingChanges] = useState<Record<string, { userId: string; role: ShareRole; isNew?: boolean }>>({});
    const [removals, setRemovals] = useState<Set<string>>(new Set());

    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingShares, setIsLoadingShares] = useState(true);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load existing shares
    useEffect(() => {
        if (!collection.id) return;
        setIsLoadingShares(true);
        getSharesForCollection(collection.id)
            .then(setShares)
            .catch(() => onShowToast?.("Failed to load shares", "error"))
            .finally(() => setIsLoadingShares(false));
    }, [collection.id]);

    // Debounced search
    const handleQueryChange = useCallback((value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!value.trim()) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchUsers(value);
                // Exclude already-shared users
                const alreadyAdded = new Set([
                    ...shares.map(s => s.user_id),
                    ...Object.values(pendingChanges).filter(c => c.isNew).map(c => c.userId),
                ]);
                setSuggestions(results.filter(u => !alreadyAdded.has(u.id)));
                setShowDropdown(true);
            } catch (err) {
                console.error("SEARCH ERROR:", err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }, [shares, pendingChanges]);

    const handleSelectUser = (user: Profile) => {
        // Add as a new pending share (default role: viewer)
        setPendingChanges(prev => ({
            ...prev,
            [user.id]: { userId: user.id, role: 'viewer', isNew: true },
        }));
        // Add a synthetic share entry to show in the list immediately
        setShares(prev => [
            ...prev,
            {
                collection_id: collection.id!,
                user_id: user.id,
                role: 'viewer',
                profile: { id: user.id, username: user.username, display_name: user.display_name, avatar_url: user.avatar_url },
            } as CollectionShare,
        ]);
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleRoleChange = (userId: string, role: ShareRole) => {
        setPendingChanges(prev => ({
            ...prev,
            [userId]: { ...prev[userId], userId, role },
        }));
        setShares(prev => prev.map(s => s.user_id === userId ? { ...s, role } : s));
    };

    const handleRemove = (userId: string) => {
        setRemovals(prev => new Set([...prev, userId]));
        setShares(prev => prev.filter(s => s.user_id !== userId));
        setPendingChanges(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
    };

    const handleSave = async () => {
        if (!collection.id) return;
        setIsSaving(true);
        try {
            // Process removals
            for (const userId of removals) {
                await removeShare(collection.id, userId);
            }
            // Process role changes / new shares
            for (const { userId, role } of Object.values(pendingChanges)) {
                await upsertShare(collection.id, userId, role);
            }
            onShowToast?.("Sharing settings saved!", "success");
            onClose();
        } catch (err: any) {
            onShowToast?.(err.message || "Failed to save sharing settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = removals.size > 0 || Object.keys(pendingChanges).length > 0;

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
                <div className="modal-content word-modal-content">
                    {/* Header */}
                    <div className="word-modal-header" style={{ backgroundColor: collection.color }}>
                        <h5 className="word-modal-title">
                            <i className="fas fa-user-plus me-2" />
                            Share Collection
                        </h5>
                        <button className="btn btn-sm word-modal-close" onClick={onClose}>
                            <i className="fas fa-times" />
                        </button>
                    </div>

                    <div className="word-modal-body">
                        {/* <div className="mb-3">
                            <label className="form-label text-muted small uppercase fw-bold mb-2">Collection Name</label>
                            <div className="p-2 rounded bg-light border d-flex align-items-center">
                                <i className="fas fa-folder me-2" style={{ color: collection.color }} />
                                <strong>{collection.name}</strong>
                            </div>
                        </div> */}

                        {/* Search */}
                        <div className="share-search-wrapper mb-2">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search" />
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by username…"
                                    value={query}
                                    onChange={e => handleQueryChange(e.target.value)}
                                    onFocus={() => query && setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                                    autoComplete="off"
                                />
                            </div>

                            {/* Dropdown suggestions */}
                            {showDropdown && suggestions.length > 0 && (
                                <div className="share-suggestions-dropdown">
                                    {suggestions.map(user => (
                                        <div
                                            key={user.id}
                                            className="share-suggestion-item"
                                            onMouseDown={() => handleSelectUser(user)}
                                        >
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} className="suggestion-avatar" alt="" />
                                            ) : (
                                                <div className="suggestion-avatar suggestion-avatar-initials">
                                                    {(user.display_name || user.username || "?").slice(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="suggestion-name">{user.display_name || user.username}</div>
                                                <div className="suggestion-username">@{user.username}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showDropdown && !isSearching && suggestions.length === 0 && query && (
                                <div className="share-suggestions-dropdown">
                                    <div className="share-no-results">No users found for "{query}"</div>
                                </div>
                            )}
                        </div>

                        {/* Shared users list */}
                        <div className="share-list">
                            {isLoadingShares ? (
                                <div className="share-list-loading">
                                    <div className="mx-auto loader" style={{ width: 28, height: 28 }} />
                                </div>
                            ) : shares.length === 0 ? (
                                <div className="share-list-empty">
                                    <i className="fas fa-users fa-2x mb-2 text-muted" />
                                    <p className="text-muted mb-0">Not shared with anyone yet</p>
                                </div>
                            ) : (
                                shares.map(share => {
                                    const p = share.profile;
                                    const initials = (p?.display_name || p?.username || "?").slice(0, 1).toUpperCase();
                                    const isOwnerRole = share.role === 'owner';
                                    return (
                                        <div key={share.user_id} className="share-user-row">
                                            <div className="share-user-info">
                                                {p?.avatar_url ? (
                                                    <img src={p.avatar_url} className="share-user-avatar" alt="" />
                                                ) : (
                                                    <div className="share-user-avatar share-user-avatar-initials">
                                                        {initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="share-user-name">{p?.display_name || p?.username || "Unknown"}</div>
                                                    <div className="share-user-handle">@{p?.username}</div>
                                                </div>
                                            </div>

                                            <div className="share-user-actions">
                                                <select
                                                    className={`share-role-select ${isOwnerRole ? 'role-owner' : ''}`}
                                                    value={share.role}
                                                    onChange={e => handleRoleChange(share.user_id, e.target.value as ShareRole)}
                                                >
                                                    {ROLE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} title={opt.description}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="share-remove-btn"
                                                    onClick={() => handleRemove(share.user_id)}
                                                    title="Remove access"
                                                >
                                                    <i className="fas fa-user-minus" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="word-modal-footer">
                        <button className="btn btn-outline-secondary" onClick={onClose}>
                            <i className="fas fa-times me-1" />
                            Cancel
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                        >
                            {isSaving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-1" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check me-1" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
