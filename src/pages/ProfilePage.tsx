import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Profile } from "../interfaces/model";
import { getProfile, getProfileStats, updateProfile, deleteAccount } from "../services/ProfileService";
import { Toast, ToastType } from "../components/Toast";
import "../styles/ProfilePage.css";
import { useNavigate } from "react-router-dom";

interface Stats {
    languagesLearning: number;
    numberOfCollections: number;
    numberOfWords: number;
}

export const ProfilePage: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<Stats>({
        languagesLearning: 0,
        numberOfCollections: 0,
        numberOfWords: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form states
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const fetchedProfile = await getProfile();
                setProfile(fetchedProfile);
                setUsername(fetchedProfile.username || "");
                setDisplayName(fetchedProfile.display_name || "");

                const fetchedStats = await getProfileStats();
                setStats(fetchedStats);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setToast({ message: "Failed to load profile data", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [user?.id]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        const trimmedUsername = username.trim();

        const isValidUsername = (u: string) => {
            if (u.length < 1 || u.length > 30) return false;
            if (!/^[a-zA-Z0-9_.]+$/.test(u)) return false;
            if (u.startsWith('.') || u.endsWith('.')) return false;
            if (u.includes('..')) return false;
            return true;
        };

        if (!isValidUsername(trimmedUsername)) {
            setToast({
                message: "Username must be 1-30 characters: letters, numbers, periods, underscores",
                type: "error"
            });
            return;
        }

        setIsSaving(true);
        try {
            const updatedProfile = await updateProfile({
                username: trimmedUsername,
                display_name: displayName.trim(),
            });
            setProfile(updatedProfile);
            await refreshProfile();
            setToast({ message: "Profile updated successfully", type: "success" });
        } catch (error: any) {
            console.error("Error updating profile:", error);
            if (error?.code === "23505") {
                setToast({ message: "Username has already existed", type: "error" });
            } else {
                setToast({ message: "Failed to update profile", type: "error" });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            // Delete account also signs out, so it will redirect to login handled by AuthContext or ProtectedRoute
            navigate("/login");
        } catch (error) {
            console.error("Error deleting account:", error);
            setToast({ message: "Failed to delete account", type: "error" });
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container my-5 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const joinedDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : "Recently";

    return (
        <div className="profile-container position-relative">
            {/* Header */}
            <div className="profile-header-card animation-fade-in">
                <div className="profile-avatar-wrapper">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="User avatar" className="profile-avatar" />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            <i className="fas fa-user"></i>
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <h1>{profile?.display_name || profile?.username || "Learner"}</h1>
                    <p className="profile-email">
                        <i className="fas fa-envelope"></i>
                        {profile?.email || user?.email}
                    </p>
                    <p className="profile-joined">
                        <i className="fas fa-calendar-alt"></i>
                        Joined {joinedDate}
                    </p>
                </div>
            </div>

            {/* Edit Info */}
            <div className="profile-section-card animation-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="profile-section-title">
                    <i className="fas fa-user-edit"></i> Edit Profile
                </h2>
                <form className="profile-form" onSubmit={handleSaveProfile}>
                    <div className="row">
                        <div className="col-md-6 form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                className="profile-form-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                        <div className="col-md-6 form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                className="profile-form-input"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="How you want to be called"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <button
                            type="submit"
                            className="btn-save-profile"
                            disabled={isSaving || (username === profile?.username && displayName === profile?.display_name)}
                        >
                            {isSaving ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                            ) : (
                                <><i className="fas fa-save"></i> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Stats */}
            <div className="profile-stats-grid animation-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-language"></i></div>
                    <div className="stat-value">{stats.languagesLearning}</div>
                    <div className="stat-label">Languages</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-book"></i></div>
                    <div className="stat-value">{stats.numberOfCollections}</div>
                    <div className="stat-label">Collections</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-layer-group"></i></div>
                    <div className="stat-value">{stats.numberOfWords}</div>
                    <div className="stat-label">Total Words</div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="profile-danger-zone animation-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="profile-section-title">
                    <i className="fas fa-exclamation-triangle"></i> Danger Zone
                </h2>
                <p className="danger-text">
                    Once you delete your account, there is no going back. All your languages, collections, words, and progress will be permanently erased.
                </p>
                <button
                    className="btn-delete-account"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteAccountModal"
                >
                    <i className="fas fa-trash-alt me-2"></i> Delete Account
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            <div className="modal fade" id="deleteAccountModal" tabIndex={-1} aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content danger-modal">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteAccountModalLabel">Confirm Deletion</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you absolutely sure you want to delete your account?</p>
                            <p className="text-danger mb-0 mt-2"><strong>This action cannot be undone.</strong></p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                data-bs-dismiss="modal"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
