import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  AuthError,
  PhoneAuthProvider,
  linkWithCredential,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth as useExistingAuth } from './useAuth';

// Extend the User interface for Firebase users
interface FirebaseUserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
  userType?: 'buyer' | 'seller' | 'agent' | 'admin';
  isVerified?: boolean;
  metadata?: {
    source: 'phone' | 'google' | 'email';
    firstLogin?: boolean;
  };
}

interface FirebaseAuthContextType {
  // Auth state
  firebaseUser: FirebaseUser | null;
  userProfile: FirebaseUserProfile | null;
  loading: boolean;
  
  // Phone auth
  sendOTP: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<FirebaseUser>;
  
  // Google auth
  signInWithGoogle: () => Promise<FirebaseUser>;
  
  // Profile management
  updateUserProfile: (updates: Partial<FirebaseUserProfile>) => Promise<void>;
  createUserProfile: (user: FirebaseUser, additionalData?: Partial<FirebaseUserProfile>) => Promise<void>;
  
  // Auth state management
  signOutFirebase: () => Promise<void>;
  
  // Utilities
  createRecaptchaVerifier: (containerId: string) => RecaptchaVerifier;
  clearRecaptcha: () => void;
  
  // Error handling
  lastError: string | null;
  clearError: () => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  const { login: existingLogin } = useExistingAuth();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Firebase auth state changed:', user?.uid || 'null');
      
      setFirebaseUser(user);
      
      if (user) {
        // Load user profile from Firestore
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as FirebaseUserProfile;
        setUserProfile(profileData);
        
        // Update last login time
        await updateDoc(doc(db, 'users', uid), {
          lastLoginAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Create reCAPTCHA verifier
  const createRecaptchaVerifier = (containerId: string): RecaptchaVerifier => {
    clearRecaptcha(); // Clear any existing verifier
    
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: () => {
        console.log('✅ reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('⏰ reCAPTCHA expired');
        setLastError('reCAPTCHA expired. Please try again.');
      }
    });
    
    setRecaptchaVerifier(verifier);
    return verifier;
  };

  // Clear reCAPTCHA
  const clearRecaptcha = () => {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (error) {
        console.log('Error clearing reCAPTCHA:', error);
      }
      setRecaptchaVerifier(null);
    }
  };

  // Send OTP to phone number
  const sendOTP = async (phoneNumber: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      setLastError(null);
      
      // Format phone number to international format
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      console.log('📱 Sending OTP to:', formattedPhone);
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      
      console.log('✅ OTP sent successfully');
      return confirmationResult;
      
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      clearRecaptcha();
      
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed';
      }
      
      setLastError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Verify OTP
  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<FirebaseUser> => {
    try {
      setLastError(null);
      
      console.log('🔐 Verifying OTP:', otp);
      
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log('✅ OTP verified successfully');
      
      // Create or update user profile
      await createUserProfile(user, {
        metadata: {
          source: 'phone',
          firstLogin: !userProfile
        }
      });
      
      // Clear reCAPTCHA after successful verification
      clearRecaptcha();
      
      return user;
      
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      
      let errorMessage = 'Invalid OTP';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code expired';
      }
      
      setLastError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    try {
      setLastError(null);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🌐 Starting Google sign-in');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('✅ Google sign-in successful');
      
      // Create or update user profile
      await createUserProfile(user, {
        metadata: {
          source: 'google',
          firstLogin: !userProfile
        }
      });
      
      return user;
      
    } catch (error: any) {
      console.error('❌ Error with Google sign-in:', error);
      
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by browser';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled';
      }
      
      setLastError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (user: FirebaseUser, additionalData?: Partial<FirebaseUserProfile>) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user profile
        const newProfile: FirebaseUserProfile = {
          uid: user.uid,
          email: user.email || undefined,
          phoneNumber: user.phoneNumber || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          createdAt: serverTimestamp() as Timestamp,
          lastLoginAt: serverTimestamp() as Timestamp,
          userType: 'buyer', // Default user type
          isVerified: true,
          ...additionalData
        };
        
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        
        console.log('✅ User profile created in Firestore');
      } else {
        // Update existing profile
        const updates = {
          lastLoginAt: serverTimestamp(),
          ...additionalData
        };
        
        await updateDoc(userRef, updates);
        
        // Reload profile
        await loadUserProfile(user.uid);
        
        console.log('✅ User profile updated in Firestore');
      }
      
    } catch (error) {
      console.error('❌ Error creating/updating user profile:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<FirebaseUserProfile>) => {
    if (!firebaseUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, updates);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      console.log('✅ User profile updated');
      
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  };

  // Sign out
  const signOutFirebase = async () => {
    try {
      clearRecaptcha();
      await signOut(auth);
      setUserProfile(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setLastError(null);
  };

  const value: FirebaseAuthContextType = {
    firebaseUser,
    userProfile,
    loading,
    sendOTP,
    verifyOTP,
    signInWithGoogle,
    updateUserProfile,
    createUserProfile,
    signOutFirebase,
    createRecaptchaVerifier,
    clearRecaptcha,
    lastError,
    clearError
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// Utility hook to integrate Firebase auth with existing auth system
export const useIntegratedAuth = () => {
  const firebaseAuth = useFirebaseAuth();
  const existingAuth = useExistingAuth();
  
  const integratedLogin = async (firebaseUser: FirebaseUser) => {
    try {
      // Convert Firebase user to existing auth format
      const existingUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        userType: 'buyer' as const, // Default type, can be updated
      };
      
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Login with existing system
      existingAuth.login(token, existingUser);
      
      console.log('✅ Integrated login successful');
      
    } catch (error) {
      console.error('❌ Error in integrated login:', error);
      throw error;
    }
  };
  
  const integratedLogout = async () => {
    try {
      await firebaseAuth.signOutFirebase();
      existingAuth.logout();
      console.log('✅ Integrated logout successful');
    } catch (error) {
      console.error('❌ Error in integrated logout:', error);
      throw error;
    }
  };
  
  return {
    ...firebaseAuth,
    ...existingAuth,
    integratedLogin,
    integratedLogout,
    isFirebaseAuth: !!firebaseAuth.firebaseUser,
    isExistingAuth: !!existingAuth.user && !firebaseAuth.firebaseUser
  };
};
