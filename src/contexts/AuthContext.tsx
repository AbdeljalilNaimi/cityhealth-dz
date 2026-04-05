import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs, serverTimestamp 
} from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { getErrorMessage, logError } from '@/utils/errorHandling';

export type UserType = 'citizen' | 'provider' | 'admin';
export type UserRole = 'patient' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  userType: UserType;
  roles: UserRole[];
  phone?: string;
  address?: string;
  date_of_birth?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'verified' | 'under_review';
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'verified' | 'under_review';
  blood_group?: string;
  emergency_opt_in?: boolean;
  weight?: number;
  height?: number;
  last_donation_date?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  supabaseUser: SupabaseUser | null;
  profile: UserProfile | null;
  session: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCitizen: boolean;
  isProvider: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: (userType?: UserType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Record<string, any>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  refreshProfile: () => Promise<void>;
  loginAsCitizen: (email: string, password: string) => Promise<void>;
  signupAsCitizen: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  loginAsCitizenWithMagicLink: (email: string) => Promise<void>;
  loginAsProvider: (email: string, password: string) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level signup guard
let _isSigningUp = false;
export function setSigningUp(value: boolean) {
  _isSigningUp = value;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSigningUpRef = useRef(false);

  const checkIsSigningUp = () => isSigningUpRef.current || _isSigningUp;

  // ─── Citizen profile from Supabase ───
  const fetchCitizenProfile = async (sbUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('citizen_profiles')
        .select('*')
        .eq('user_id', sbUser.id)
        .maybeSingle();

      if (error) throw error;

      const p = data;
      setProfile({
        id: sbUser.id,
        email: sbUser.email || '',
        full_name: p?.full_name || sbUser.user_metadata?.full_name || null,
        avatar_url: p?.avatar_url || sbUser.user_metadata?.avatar_url || null,
        userType: 'citizen',
        roles: ['patient'],
        phone: p?.phone,
        address: p?.address,
        date_of_birth: p?.date_of_birth,
        blood_group: p?.blood_group,
        emergency_opt_in: p?.emergency_opt_in,
        weight: p?.weight ? Number(p.weight) : undefined,
        height: p?.height ? Number(p.height) : undefined,
        last_donation_date: p?.last_donation_date,
      });
    } catch (err) {
      console.error('Error fetching citizen profile:', err);
      // Still set a basic profile so the user isn't stuck
      setProfile({
        id: sbUser.id,
        email: sbUser.email || '',
        full_name: sbUser.user_metadata?.full_name || null,
        avatar_url: sbUser.user_metadata?.avatar_url || null,
        userType: 'citizen',
        roles: ['patient'],
      });
    }
  };

  // ─── Provider/Admin profile from Firestore ───
  const fetchFirebaseProfile = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);
      let userType: UserType = 'provider';
      if (userSnap.exists()) {
        userType = userSnap.data().userType || 'provider';
      }

      const profileRef = doc(db, 'profiles', fbUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          id: fbUser.uid, email: fbUser.email,
          full_name: null, avatar_url: null,
          created_at: serverTimestamp(), updated_at: serverTimestamp()
        });
        setProfile({ id: fbUser.uid, email: fbUser.email || '', full_name: null, avatar_url: null, userType, roles: [] });
        return;
      }

      const pd = profileSnap.data();
      let roles: UserRole[] = [];
      try {
        const possibleRoles: UserRole[] = ['patient', 'provider', 'admin'];
        const roleResults = await Promise.all(
          possibleRoles.map(async (r) => {
            const d = await getDoc(doc(db, 'user_roles', `${fbUser.uid}_${r}`));
            return d.exists() ? r : null;
          })
        );
        roles = roleResults.filter((r): r is UserRole => r !== null);
      } catch { /* continue */ }

      let verificationStatus = pd.verification_status;
      if (userType === 'provider') {
        const provQ = query(collection(db, 'providers'), where('userId', '==', fbUser.uid));
        const provSnap = await getDocs(provQ);
        if (!provSnap.empty) verificationStatus = provSnap.docs[0].data().verificationStatus;
      }

      setProfile({
        id: pd.id, email: fbUser.email || '',
        full_name: pd.full_name, avatar_url: pd.avatar_url,
        userType, roles,
        phone: pd.phone, address: pd.address, date_of_birth: pd.date_of_birth,
        verification_status: verificationStatus, verificationStatus,
        blood_group: pd.blood_group, emergency_opt_in: pd.emergency_opt_in,
        weight: pd.weight, height: pd.height, last_donation_date: pd.last_donation_date,
      });
    } catch (err) {
      console.error('Error fetching firebase profile:', err);
      setProfile(null);
    }
  };

  // ─── Supabase auth listener (citizens) ───
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchCitizenProfile(session.user), 0);
        } else {
          // Only clear if no Firebase user is active
          if (!user) {
            setSupabaseUser(null);
            if (profile?.userType === 'citizen') setProfile(null);
          } else {
            setSupabaseUser(null);
          }
        }
        setIsLoading(false);
      }
    );
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchCitizenProfile(session.user);
      }
      // Don't set isLoading false here; Firebase listener will handle it
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── Firebase auth listener (providers/admins) ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (checkIsSigningUp()) { setIsLoading(false); return; }

      if (fbUser) {
        try { await fbUser.reload(); } catch {
          await firebaseSignOut(firebaseAuth);
          setUser(null);
          if (profile?.userType !== 'citizen') setProfile(null);
          setIsLoading(false);
          return;
        }
        setUser(fbUser);
        setTimeout(() => fetchFirebaseProfile(fbUser), 0);
      } else {
        setUser(null);
        // Only clear profile if no Supabase citizen is active
        if (!supabaseUser) setProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── Citizen auth methods (Supabase) ───

  const signupAsCitizen = async (email: string, password: string, fullName: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/email-verified`,
        },
      });
      if (error) throw error;

      // Update profile with phone if provided
      if (data.user && phone) {
        await supabase.from('citizen_profiles').update({ phone, full_name: fullName }).eq('user_id', data.user.id);
      }
    } catch (error: any) {
      logError(error, 'signupAsCitizen');
      const msg = error?.message || 'Erreur lors de l\'inscription';
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsCitizen = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Bienvenue sur CityHealth!');
    } catch (error: any) {
      logError(error, 'loginAsCitizen');
      if (error?.message?.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter.');
      } else {
        toast.error(error?.message || 'Erreur de connexion');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsCitizenWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/profile` },
      });
      if (error) throw error;
      toast.success('Lien magique envoyé ! Vérifiez votre email.');
    } catch (error: any) {
      logError(error, 'magicLink');
      toast.error(error?.message || 'Erreur lors de l\'envoi');
      throw error;
    }
  };

  const loginWithGoogle = async (_userType: UserType = 'citizen') => {
    // Handled by the calling page using lovable.auth.signInWithOAuth
    // This is kept for backward compatibility but the actual implementation
    // is in the login/register pages
  };

  // ─── Provider auth (Firebase) ───
  const loginAsProvider = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      if (!userDoc.exists()) {
        await firebaseSignOut(firebaseAuth);
        toast.error('Compte prestataire non configuré.');
        throw new Error('Provider account not configured');
      }
      if (userDoc.data().userType !== 'provider') {
        await firebaseSignOut(firebaseAuth);
        toast.error('Ce compte n\'est pas un compte prestataire.');
        throw new Error('Invalid user type');
      }
      toast.success('Bienvenue sur votre espace prestataire!');
    } catch (error: any) {
      logError(error, 'loginAsProvider');
      if (!['Provider account not configured', 'Invalid user type'].includes(error.message)) {
        toast.error(getErrorMessage(error, 'fr'));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Admin auth (Firebase) ───
  const loginAsAdmin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      if (!userDoc.exists() || userDoc.data().userType !== 'admin') {
        await firebaseSignOut(firebaseAuth);
        toast.error('Accès refusé. Compte non administrateur.');
        throw new Error('Invalid user type');
      }
      toast.success('Bienvenue Administrateur!');
    } catch (error: any) {
      logError(error, 'loginAsAdmin');
      if (error.message !== 'Invalid user type') toast.error(getErrorMessage(error, 'fr'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Logout (both systems) ───
  const logout = async () => {
    try {
      // Sign out from both
      const isCitizenSession = !!supabaseUser;
      if (isCitizenSession) {
        await supabase.auth.signOut();
        setSupabaseUser(null);
      }
      if (user) {
        await firebaseSignOut(firebaseAuth);
        setUser(null);
      }
      setProfile(null);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      logError(error, 'logout');
      toast.error('Erreur lors de la déconnexion');
      throw error;
    }
  };

  // ─── Legacy methods ───
  const login = async (email: string, password: string) => {
    await loginAsCitizen(email, password);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    await signupAsCitizen(email, password, fullName);
  };

  // ─── Update profile ───
  const updateProfile = async (updates: Record<string, any>) => {
    if (supabaseUser) {
      // Citizen: update Supabase
      const { error } = await supabase
        .from('citizen_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', supabaseUser.id);
      if (error) throw error;
      await fetchCitizenProfile(supabaseUser);
      toast.success('Profil mis à jour');
    } else if (user) {
      // Provider/Admin: update Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const cleanUpdates: Record<string, any> = { updated_at: serverTimestamp() };
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) cleanUpdates[key] = value;
      }
      await updateDoc(profileRef, cleanUpdates);
      if (updates.full_name) await firebaseUpdateProfile(user, { displayName: updates.full_name });
      if (user.email) await fetchFirebaseProfile(user);
      toast.success('Profil mis à jour');
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (role === 'patient' && profile?.userType === 'citizen') return true;
    return profile?.roles.includes(role) ?? false;
  };

  const isCitizen = profile?.userType === 'citizen';
  const isProvider = profile?.userType === 'provider';
  const isAdmin = profile?.userType === 'admin';

  const refreshProfile = async () => {
    if (supabaseUser) await fetchCitizenProfile(supabaseUser);
    else if (user?.uid && user?.email) await fetchFirebaseProfile(user);
  };

  const isAuthenticated = !!(supabaseUser || user);

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        profile,
        session: user,
        isAuthenticated,
        isLoading,
        isCitizen, isProvider, isAdmin,
        login, signup, loginWithGoogle, logout,
        updateProfile, hasRole, refreshProfile,
        loginAsCitizen, signupAsCitizen, loginAsCitizenWithMagicLink,
        loginAsProvider, loginAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
