import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from './store';

export function initializeAuthListener() {
  return onAuthStateChanged(auth, async (user) => {
    const { setUser, setUserProfile, setIsAdmin, setLoading } = useAuthStore.getState();
    
    setUser(user);
    
    if (user) {
      // Check admin status first based on new firestore rules
      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef).catch(() => null);
      const isAdminUser = !!adminSnap?.exists() || user.email === 'admin@samir.com';
      setIsAdmin(isAdminUser);

      // Fetch or create user profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const profileData = userSnap.data();
        setUserProfile(profileData);
        
        // Listen to realtime updates
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
          }
        });
      } else {
        // Create new user profile if not exists
        const newUserProfile = {
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          avatar: user.photoURL || '',
          phone: '',
          country: '',
          walletBalance: 0,
          bonusBalance: 0,
          lockedBalance: 0,
          totalEarnings: 0,
          totalMatches: 0,
          wins: 0,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          accountStatus: 'active',
          createdDate: new Date().toISOString(),
          role: isAdminUser ? 'admin' : 'user'
        };
        await setDoc(userRef, newUserProfile);
        setUserProfile(newUserProfile);
      }
    } else {
      setUserProfile(null);
      setIsAdmin(false);
    }
    
    setLoading(false);
  });
}
