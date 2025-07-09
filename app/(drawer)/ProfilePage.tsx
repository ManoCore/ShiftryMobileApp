// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   TouchableOpacity,
// } from 'react-native';
// import { useRouter } from 'expo-router'; // For navigation in Expo Router
// import { useAuth } from '../../context/AuthContext'; // Import useAuth!
// import TopBar from '../../components/TopBar'; // Adjust path as needed

// // Import the new components (will be created next)
// import UserProfileContent from '../../components/UserProfileContent'; // Assuming components folder
// import LeaveApplicationForm from '../../components/LeaveApplicationForm'; // Assuming components folder

// export default function ProfilePage() {
//   const router = useRouter();
//   const { user, isLoading, signOut } = useAuth(); // Added signOut for logout functionality

//   // State to manage which tab is active: 'profile' or 'leaves'
//   const [activeTab, setActiveTab] = useState<'profile' | 'leaves'>('profile');

//   // Redirect if not authenticated after loading
//   useEffect(() => {
//     if (!isLoading && !user) {
//       router.replace('/login'); // Redirect to login if not authenticated
//     }
//   }, [isLoading, user, router]);

//   // Handle profile icon press in TopBar (if you want to use it for something specific on this page)
//   const handleProfileIconPress = useCallback(() => {
//     // For example, you could open a settings modal or log out directly
//     console.log("Profile icon pressed on ProfilePage!");
//     // For now, let's just ensure it's handled.
//   }, []);

//   const handleNotificationIconPress = useCallback(() => {
//     console.log("Notification icon pressed on ProfilePage!");
//     // router.push('/notifications'); // Example: navigate to a notifications screen
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0061D0" />
//         <Text style={styles.loadingText}>Loading profile...</Text>
//       </View>
//     );
//   }

//   if (!user) {
//     // This case is handled by useEffect redirecting to login
//     return null;
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor="#007bff" />
//       <TopBar
//         title="My Profile" // Static title for ProfilePage, or make dynamic if needed
//         onNotificationPress={handleNotificationIconPress}
//         onProfilePress={handleProfileIconPress} // Pass a handler if needed
//       />

//       <View style={styles.contentContainer}>
//         {/* Tab Navigation */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
//             onPress={() => setActiveTab('profile')}
//           >
//             <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.activeTabButtonText]}>
//               User Profile
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'leaves' && styles.activeTabButton]}
//             onPress={() => setActiveTab('leaves')}
//           >
//             <Text style={[styles.tabButtonText, activeTab === 'leaves' && styles.activeTabButtonText]}>
//               Leaves
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Dynamic Content based on activeTab */}
//         <View style={styles.tabContent}>
//           {activeTab === 'profile' && (
//             <UserProfileContent /> // UserProfileContent will fetch its own user data
//           )}
//           {activeTab === 'leaves' && (
//             <LeaveApplicationForm />
//           )}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F3F4F6', // Light gray background for the whole page
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   contentContainer: {
//     flex: 1,
//     backgroundColor: '#F3F4F6', // Match safeArea background
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     paddingVertical: 10,
//   },
//   tabButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   activeTabButton: {
//     backgroundColor: '#007bff', // Active tab background color
//   },
//   tabButtonText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#4B5563', // Default text color
//   },
//   activeTabButtonText: {
//     color: '#FFFFFF', // Active tab text color
//   },
//   tabContent: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: '#F3F4F6', // Background for the content within tabs
//   },
// });


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router'; // For navigation in Expo Router
import { useAuth } from '../../context/AuthContext'; // Import useAuth!
import TopBar from '../../components/TopBar'; // Adjust path as needed

// Import the new components
import UserProfileContent from '../../components/UserProfileContent'; // Assuming components folder
import LeaveApplicationForm from '../../components/LeaveApplicationForm'; // Assuming components folder

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth(); // Added signOut for logout functionality

  // State to manage which tab is active: 'profile' or 'leaves'
  const [activeTab, setActiveTab] = useState<'profile' | 'leaves'>('profile');

  // Log the activeTab state to debug
  useEffect(() => {
    console.log("ProfilePage: Current activeTab is:", activeTab);
  }, [activeTab]);


  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [isLoading, user, router]);

  // handleProfileIconPress is no longer needed here as TopBar handles its own profile navigation
  // const handleProfileIconPress = useCallback(() => {
  //   console.log("Profile icon pressed on ProfilePage!");
  // }, []);

  const handleNotificationIconPress = useCallback(() => {
    console.log("Notification icon pressed on ProfilePage!");
    // router.push('/notifications'); // Example: navigate to a notifications screen
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0061D0" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    // This case is handled by useEffect redirecting to login
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />
      <TopBar
        title="My Profile" // Static title for ProfilePage, or make dynamic if needed
        // onNotificationPress={handleNotificationIconPress}
        // Removed onProfilePress prop as TopBar now handles its own profile navigation
      />

      <View style={styles.contentContainer}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.activeTabButtonText]}>
              User Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'leaves' && styles.activeTabButton]}
            onPress={() => setActiveTab('leaves')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'leaves' && styles.activeTabButtonText]}>
              Leaves
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Content based on activeTab */}
        <View style={styles.tabContent}>
          {activeTab === 'profile' && (
            <UserProfileContent /> // UserProfileContent will fetch its own user data
          )}
          {activeTab === 'leaves' && (
            <LeaveApplicationForm />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background for the whole page
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Match safeArea background
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#007bff', // Active tab background color
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', // Default text color
  },
  activeTabButtonText: {
    color: '#FFFFFF', // Active tab text color
  },
  tabContent: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F3F4F6', // Background for the content within tabs
  },
});
