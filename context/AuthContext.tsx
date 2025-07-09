// import React, {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   ReactNode,
//   useCallback
// } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // For React Native persistent storage
// // import axios from 'axios'; // Not directly used here, but likely in your api.ts

// // Import your actual fetchUserProfile function from your API service
// import { fetchUserProfile } from '@/services/api'; // <--- IMPORTANT: Verify this path is correct for your project structure

// // Define the shape of your User object (adjust based on your backend response)
// interface User {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: 'admin' | 'manager' | 'careWorker' | 'employee'; // Example roles
//   profilePicture?: string; // Optional profile picture URL
//   // Add any other user properties you expect from your backend
// }

// // Define the shape of the AuthContext value
// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   signIn: (token: string) => Promise<void>;
//   signOut: () => Promise<void>;
//   updateUser: (newUserData: User) => void; // Added updateUser to context type
//   isLoggedIn: boolean; // Added isLoggedIn to context type
//   token: string | null; // Added token to context type
// }

// // Create the AuthContext
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Define the AuthProvider props
// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true); // Start as true

//   useEffect(() => {
//     const initializeAuth = async () => {
//       setIsLoading(true); // Ensure isLoading is true at the start of initialization
//       let tempIsLoggedIn = false; // Flag to track login status during initialization
//       let tempUser: User | null = null; // Temporary user object for internal logic

//       try {
//         const storedToken = await AsyncStorage.getItem('token'); // Use AsyncStorage
//         const storedUser = await AsyncStorage.getItem('user'); // Use AsyncStorage

//         if (storedToken) {
//           setToken(storedToken); // Set token immediately

//           // CRITICAL CHANGE: Load from AsyncStorage FIRST if a token exists
//           if (storedUser) {
//             try {
//               const parsedUser: User = JSON.parse(storedUser);
//               setUser(parsedUser); // Set user state optimistically from AsyncStorage
//               setIsLoggedIn(true); // Assume logged in for now
//               tempUser = parsedUser; // Store for later checks
//               tempIsLoggedIn = true;
//               console.log("AuthContext: User data loaded from AsyncStorage immediately:", parsedUser);
//             } catch (parseError) {
//               console.error("AuthContext: Error parsing stored user from AsyncStorage. Clearing corrupted data.", parseError);
//               await AsyncStorage.removeItem('user'); // Clear corrupted user data
//             }
//           }

//           // Then, attempt to fetch fresh user profile from the server
//           // This runs AFTER (or at least considers) the AsyncStorage load.
//           try {
//             const { data } = await fetchUserProfile(); // Assuming fetchUserProfile returns { data: User }
//             // Only update if server data is genuinely different or more complete
//             if (JSON.stringify(data) !== storedUser) {
//               setUser(data); // Update with fresh data from API
//               await AsyncStorage.setItem('user', JSON.stringify(data)); // Store fresh data
//               console.log("AuthContext: User profile updated from API:", data);
//             }
//             setIsLoggedIn(true); // Confirm logged in based on successful API fetch
//             tempUser = data; // Update tempUser with API data
//             tempIsLoggedIn = true;
//           } catch (apiError) {
//             console.warn("AuthContext: Token found, but failed to fetch fresh user profile.", apiError);
//             // If API fetch fails, and we couldn't load from AsyncStorage earlier, then we're not logged in.
//             // If tempIsLoggedIn is true, it means AsyncStorage successfully set the user, so we rely on that.
//             if (!tempIsLoggedIn) { // This means neither API nor initial AsyncStorage parse succeeded
//               console.error("AuthContext: No valid user data found after API fetch failed. Clearing authentication state.");
//               await AsyncStorage.removeItem('token');
//               await AsyncStorage.removeItem('user');
//               setToken(null);
//               setUser(null);
//               setIsLoggedIn(false);
//             }
//           }
//         } else {
//           // No token found, so definitely not logged in
//           setIsLoggedIn(false);
//           setUser(null);
//           setToken(null);
//           await AsyncStorage.removeItem('user'); // Ensure no stale user data when no token
//         }
//       } catch (e) {
//         // This catch handles any unexpected errors during the entire process
//         console.error("AuthContext: Unexpected error during authentication initialization. Clearing state.", e);
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('user');
//         setToken(null);
//         setUser(null);
//         setIsLoggedIn(false);
//       } finally {
//         setIsLoading(false); // Set to false only after all async operations are done
//       }
//     };

//     initializeAuth();
//   }, []); // Empty dependency array, runs only once on component mount

//   const signIn = useCallback(async (jwtToken: string, userData: User) => {
//     await AsyncStorage.setItem('token', jwtToken); // Use AsyncStorage
//     await AsyncStorage.setItem('user', JSON.stringify(userData)); // Use AsyncStorage
//     setToken(jwtToken);
//     setUser(userData); // Update state immediately
//     setIsLoggedIn(true);
//     console.log("AuthContext: User logged in, state updated to:", userData);
//     // Optionally, if login response is minimal, you might want to fetch full profile here too
//     // fetchUserProfile().then(({ data }) => setUser(data)).catch(console.error);
//   }, []);

//   const updateUser = useCallback(async (newUserData: User) => {
//     console.log("AuthContext: updateUser called with:", newUserData);
//     setUser(newUserData);
//     await AsyncStorage.setItem('user', JSON.stringify(newUserData)); // Also update AsyncStorage
//     console.log("AuthContext: User state updated by updateUser to:", newUserData);
//   }, []);

//   const signOut = useCallback(async () => {
//     setIsLoading(true); // Set loading while signing out
//     try {
//       await AsyncStorage.removeItem('token'); // Use AsyncStorage
//       await AsyncStorage.removeItem('user'); // Use AsyncStorage
//       setToken(null);
//       setUser(null);
//       setIsLoggedIn(false);
//       console.log("AuthContext: User signed out.");
//     } catch (e) {
//       console.error('Sign-out failed:', e);
//       // Even if removal fails, clear local state
//       setToken(null);
//       setUser(null);
//       setIsLoggedIn(false);
//     } finally {
//       setIsLoading(false); // End loading after sign out
//     }
//   }, []);

//   // The value provided by the context
//   const authContextValue: AuthContextType = {
//     isLoggedIn,
//     user,
//     token,
//     signIn,
//     signOut,
//     isLoading,
//     updateUser,
//   };

//   return (
//     <AuthContext.Provider value={authContextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) { // Changed from !context to check for undefined
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context as AuthContextType; // Assert type for consumers
// };

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For React Native persistent storage
// import axios from 'axios'; // Not directly used here, but likely in your api.ts

// Import your actual fetchUserProfile function from your API service
import { fetchUserProfile } from '@/services/api'; // <--- IMPORTANT: Verify this path is correct for your project structure

// Define the shape of your User object (adjust based on your backend response)
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'careWorker' | 'employee'; // Example roles
  profilePicture?: string; // Optional profile picture URL
  // Add any other user properties you expect from your backend
}

// Define the shape of the AuthContext value
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, userData: User) => Promise<void>; // <--- MODIFIED LINE: Added userData
  signOut: () => Promise<void>;
  updateUser: (newUserData: User) => void; // Added updateUser to context type
  isLoggedIn: boolean; // Added isLoggedIn to context type
  token: string | null; // Added token to context type
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true); // Ensure isLoading is true at the start of initialization
      let tempIsLoggedIn = false; // Flag to track login status during initialization
      let tempUser: User | null = null; // Temporary user object for internal logic

      try {
        const storedToken = await AsyncStorage.getItem('token'); // Use AsyncStorage
        const storedUser = await AsyncStorage.getItem('user'); // Use AsyncStorage

        if (storedToken) {
          setToken(storedToken); // Set token immediately

          // CRITICAL CHANGE: Load from AsyncStorage FIRST if a token exists
          if (storedUser) {
            try {
              const parsedUser: User = JSON.parse(storedUser);
              setUser(parsedUser); // Set user state optimistically from AsyncStorage
              setIsLoggedIn(true); // Assume logged in for now
              tempUser = parsedUser; // Store for later checks
              tempIsLoggedIn = true;
              console.log("AuthContext: User data loaded from AsyncStorage immediately:", parsedUser);
            } catch (parseError) {
              console.error("AuthContext: Error parsing stored user from AsyncStorage. Clearing corrupted data.", parseError);
              await AsyncStorage.removeItem('user'); // Clear corrupted user data
            }
          }

          // Then, attempt to fetch fresh user profile from the server
          // This runs AFTER (or at least considers) the AsyncStorage load.
          try {
            const { data } = await fetchUserProfile(); // Assuming fetchUserProfile returns { data: User }
            // Only update if server data is genuinely different or more complete
            if (JSON.stringify(data) !== storedUser) {
              setUser(data); // Update with fresh data from API
              await AsyncStorage.setItem('user', JSON.stringify(data)); // Store fresh data
              console.log("AuthContext: User profile updated from API:", data);
            }
            setIsLoggedIn(true); // Confirm logged in based on successful API fetch
            tempUser = data; // Update tempUser with API data
            tempIsLoggedIn = true;
          } catch (apiError) {
            console.warn("AuthContext: Token found, but failed to fetch fresh user profile.", apiError);
            // If API fetch fails, and we couldn't load from AsyncStorage earlier, then we're not logged in.
            // If tempIsLoggedIn is true, it means AsyncStorage successfully set the user, so we rely on that.
            if (!tempIsLoggedIn) { // This means neither API nor initial AsyncStorage parse succeeded
              console.error("AuthContext: No valid user data found after API fetch failed. Clearing authentication state.");
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              setToken(null);
              setUser(null);
              setIsLoggedIn(false);
            }
          }
        } else {
          // No token found, so definitely not logged in
          setIsLoggedIn(false);
          setUser(null);
          setToken(null);
          await AsyncStorage.removeItem('user'); // Ensure no stale user data when no token
        }
      } catch (e) {
        // This catch handles any unexpected errors during the entire process
        console.error("AuthContext: Unexpected error during authentication initialization. Clearing state.", e);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false); // Set to false only after all async operations are done
      }
    };

    initializeAuth();
  }, []); // Empty dependency array, runs only once on component mount

  const signIn = useCallback(async (jwtToken: string, userData: User) => {
    await AsyncStorage.setItem('token', jwtToken); // Use AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData)); // Use AsyncStorage
    setToken(jwtToken);
    setUser(userData); // Update state immediately
    setIsLoggedIn(true);
    console.log("AuthContext: User logged in, state updated to:", userData);
    // Optionally, if login response is minimal, you might want to fetch full profile here too
    // fetchUserProfile().then(({ data }) => setUser(data)).catch(console.error);
  }, []);

  const updateUser = useCallback(async (newUserData: User) => {
    console.log("AuthContext: updateUser called with:", newUserData);
    setUser(newUserData);
    await AsyncStorage.setItem('user', JSON.stringify(newUserData)); // Also update AsyncStorage
    console.log("AuthContext: User state updated by updateUser to:", newUserData);
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true); // Set loading while signing out
    try {
      await AsyncStorage.removeItem('token'); // Use AsyncStorage
      await AsyncStorage.removeItem('user'); // Use AsyncStorage
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      console.log("AuthContext: User signed out.");
    } catch (e) {
      console.error('Sign-out failed:', e);
      // Even if removal fails, clear local state
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); // End loading after sign out
    }
  }, []);

  // The value provided by the context
  const authContextValue: AuthContextType = {
    isLoggedIn,
    user,
    token,
    signIn,
    signOut,
    isLoading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as AuthContextType; // Assert type for consumers
};
