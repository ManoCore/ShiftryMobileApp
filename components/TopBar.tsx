// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { DrawerNavigationProp } from '@react-navigation/drawer';
// import { useRouter } from 'expo-router'; // Import useRouter for navigation

// interface TopBarProps {
//   title?: string;
//   onNotificationPress?: () => void; // Prop for notification icon press (still external)
// }

// // Explicitly type the functional component with React.FC<TopBarProps>
// const TopBar: React.FC<TopBarProps> = ({ title = "Dashboard", onNotificationPress}) => {
//   const navigation = useNavigation<DrawerNavigationProp<any>>();
//   const router = useRouter(); // Initialize useRouter

//   // Internal function to handle profile navigation
//   const handleProfilePress = () => {
//     router.push({ pathname: '/ProfilePage' as any }); // Navigate to the profile page
//   };

//   return (
//     <View style={styles.header}>
//       {/* Menu Button */}
//       <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
//         <Ionicons name="menu" size={24} color="#fff" />
//       </TouchableOpacity>

//       {/* Title */}
//       <Text style={styles.title}>{title}</Text>

//       {/* Right-side Icons */}
//       <View style={styles.rightIconsContainer}>
//         {/* Notification Icon - always displayed, uses external prop */}
//         <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
//           <Ionicons name="notifications-outline" size={24} color="#fff" />
//         </TouchableOpacity>
//         {/* Profile Icon - always displayed, uses internal handler */}
//         <TouchableOpacity onPress={handleProfilePress} style={styles.iconButton}>
//           <Ionicons name="person-circle-outline" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     height: 60,
//     backgroundColor: '#007bff', // Assuming this is your primary blue color
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//   },
//   menuButton: {
//     padding: 4,
//   },
//   title: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//     // flex: 1, // Uncomment if you want the title to take all available space
//     textAlign: 'center', // Center the title if flex: 1 is used
//   },
//   rightIconsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     padding: 4,
//     marginLeft: 10, // Space between icons
//   },
// });

// export default TopBar;


import React, { useState } from 'react'; // Import useState
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import NotificationPopup from '../components/NotificationPopup'; // Import NotificationPopup (adjust path if needed)

interface TopBarProps {
  title?: string;
  // onNotificationPress?: () => void; // Removed: Notification popup handled internally
  onMenuPress?: () => void; // Prop for menu icon press
  onProfilePress?: () => void; // Prop for profile icon press
}

// Explicitly type the functional component with React.FC<TopBarProps>
const TopBar: React.FC<TopBarProps> = ({ title = "Dashboard", onMenuPress, onProfilePress }) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter(); // Initialize useRouter

  // State to manage the visibility of the notification popup
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Internal function to handle profile navigation
  const internalHandleProfilePress = () => {
    router.push({ pathname: '/ProfilePage' as any }); // Navigate to the profile page
  };

  // Internal function to handle notification icon press
  const handleNotificationIconPress = () => {
    setShowNotificationPopup(true); // Open the notification popup
  };

  return (
    <View style={styles.header}>
      {/* Menu Button */}
      <TouchableOpacity onPress={onMenuPress || (() => navigation.openDrawer())} style={styles.menuButton}>
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right-side Icons */}
      <View style={styles.rightIconsContainer}>
        {/* Notification Icon - always displayed, uses internal handler */}
        <TouchableOpacity onPress={handleNotificationIconPress} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Profile Icon - always displayed, uses external prop if provided, else internal handler */}
        <TouchableOpacity onPress={onProfilePress || internalHandleProfilePress} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Notification Popup - rendered within TopBar */}
      <NotificationPopup
        isVisible={showNotificationPopup}
        onClose={() => setShowNotificationPopup(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#007bff', // Assuming this is your primary blue color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  menuButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    // flex: 1, // Uncomment if you want the title to take all available space
    textAlign: 'center', // Center the title if flex: 1 is used
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 10, // Space between icons
  },
});

export default TopBar;
