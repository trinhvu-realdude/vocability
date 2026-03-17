import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../configs/supabase";
import { Profile } from "../interfaces/model";
import { getProfile } from "../services/ProfileService";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    profile: Profile | null;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => {},
    profile: null,
    refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);

    const refreshProfile = async () => {
        try {
            const p = await getProfile();
            setProfile(p);
        } catch (error) {
            console.error("Error fetching profile in AuthContext:", error);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    useEffect(() => {
        if (user?.id) {
            refreshProfile();
        } else {
            setProfile(null);
        }
    }, [user?.id]);

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, profile, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
