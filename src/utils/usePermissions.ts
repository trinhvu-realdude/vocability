import { useState, useEffect } from "react";
import { ShareRole } from "../interfaces/model";
import { getUserRole } from "../services/ShareService";

export type EffectiveRole = ShareRole | 'owner' | null;

export interface Permissions {
    role: EffectiveRole;
    isOwner: boolean;
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
    canPractice: boolean;
    canReview: boolean;
    canFavorite: boolean;
    isLoading: boolean;
}

/**
 * Returns the current user's permissions for a given collection.
 * Pass `undefined` or `null` to get a fully-restricted set while loading.
 */
export const usePermissions = (collectionId: string | undefined | null): Permissions => {
    const [role, setRole] = useState<EffectiveRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!collectionId) {
            setIsLoading(false);
            return;
        }
        let cancelled = false;
        setIsLoading(true);

        getUserRole(collectionId).then((r) => {
            if (!cancelled) {
                setRole(r);
                setIsLoading(false);
            }
        }).catch(() => {
            if (!cancelled) setIsLoading(false);
        });

        return () => { cancelled = true; };
    }, [collectionId]);

    const isOwner = role === 'owner';
    const canEdit = role === 'owner' || role === 'editor';
    const canShare = isOwner;
    const canDelete = role === 'owner';
    const canPractice = role === 'owner';
    const canReview = role === 'owner';
    const canFavorite = role === 'owner';

    return { role, isOwner, canEdit, canShare, canDelete, canPractice, canReview, canFavorite, isLoading };
};
