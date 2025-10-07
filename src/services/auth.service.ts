import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firestore } from './firebase';

export interface ExtendedUserData {
  uid: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role?: string;
}


export const signInService = async (email: string, password: string): Promise<FirebaseAuthTypes.User> => {
  const res = await auth().signInWithEmailAndPassword(email, password);
  return res.user;
};

export const signUpService = async (email: string, password: string): Promise<FirebaseAuthTypes.User> => {
  const res = await auth().createUserWithEmailAndPassword(email, password);
  return res.user;
};

export const signOutService = async (): Promise<void> => {
  await auth().signOut();
};

export const onAuthChangedService = (callback: (user: FirebaseAuthTypes.User | null) => void) => {
  return auth().onAuthStateChanged(callback);
};

export const getUserData = async (uid: string): Promise<ExtendedUserData | null> => {
  try {
    const doc = await firestore().collection('users').doc(uid).get();
    if (!doc.exists) {
      console.log('User document does not exist');
      return null;
    }
    const data = doc.data();
    return {
      uid,
      name: data?.name ?? '',
      email: data?.email ?? '',
      mobileNumber: data?.mobileNumber ?? '',
      role: data?.role ?? '',
    };
  } catch (error) {
    console.log('Error fetching user data:', error);
    return null;
  }
};



