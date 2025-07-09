// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   SafeAreaView, 
//   StatusBar,    
//   Platform,     
// } from 'react-native';
// import { fetchAllUsers } from '@/services/api'; 
// import TopBar from '@/components/TopBar';


// // Define User interface
// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   accessLevel: string;
//   status?: string;
//   visaStatus?: string;
//   employmentType?: string;
//   training?: string;
// }

// // Dummy data for Training as it may not be in the user object
// const getTrainingStatus = (email: string): string => {
//   if (email.includes('example.com')) return 'Completed';
//   if (email.includes('test.com')) return 'In Progress';
//   return 'N/A';
// };

// const PeoplePage: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');
//   const [searchQuery, setSearchQuery] = useState<string>('');

//   // Fetch users from backend
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllUsers();
//       const formattedUsers: User[] = res.data.map((user: any) => ({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         accessLevel: user.access,
//         status: user.status,
//         visaStatus: user.visaStatus,
//         employmentType: user.employmentType,
//         training: user.training || getTrainingStatus(user.email),
//       }));
//       setUsers(formattedUsers);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching users:', err);
//       setError('Failed to load users. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Filter users based on search query
//   const filteredUsers = users.filter(
//     (user) =>
//       (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
//       (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
//       (user.accessLevel && user.accessLevel.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const renderUser = ({ item: user }: { item: User }) => (
//     <View style={styles.userCard}>
//       <View style={styles.userCardContent}>
//         <Text style={styles.userName}>{user.name}</Text>
//         <Text style={styles.userDetail}>
//           <Text style={styles.label}>Access: </Text>
//           {user.accessLevel || 'N/A'}
//         </Text>
//         <Text style={styles.userDetail}>
//           <Text style={styles.label}>Email: </Text>
//           {user.email}
//         </Text>
//         <Text style={styles.userDetail}>
//           <Text style={styles.label}>Training: </Text>
//           {user.training || 'N/A'}
//         </Text>
//         <Text style={styles.userDetail}>
//           <Text style={styles.label}>Visa Status: </Text>
//           {user.visaStatus || 'N/A'}
//         </Text>
//         <Text style={styles.userDetail}>
//           <Text style={styles.label}>Employment Type: </Text>
//           {user.employmentType || 'N/A'}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}> {/* Wrapped with SafeAreaView */}
//       <StatusBar barStyle="light-content" backgroundColor="#0061D0" /> {/* Added StatusBar */}

//       <TopBar title="People" />

//       {/* Main Content */}
//       <View style={styles.mainContent}> {/* This will now be the white content area */}
//         <View style={styles.contentHeader}>
//           <Text style={styles.contentTitle}>Team Members</Text>
//           <Text style={styles.subTitle}>
//             Showing {filteredUsers.length} Out of {users.length} Users
//           </Text>
//           <View style={styles.contentHeaderActions}>
//             <View style={styles.searchContainer}>
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//               />
//             </View>
//           </View>
//         </View>

//         {error && (
//           <Text style={styles.errorText}>{error}</Text>
//         )}

//         {loading ? (
//           <ActivityIndicator size="large" color="#2563EB" style={styles.loading} />
//         ) : filteredUsers.length === 0 ? (
//           <Text style={styles.emptyText}>No users found matching your search.</Text>
//         ) : (
//           <FlatList
//             data={filteredUsers}
//             renderItem={renderUser}
//             keyExtractor={(item) => item._id}
//             ListEmptyComponent={() => (
//               <Text style={styles.emptyText}>No users to display.</Text>
//             )}
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { // New style for SafeAreaView
//     flex: 1,
//     backgroundColor: '#0061D0', // Blue background for the safe area
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#0061D0', // Changed to blue to match top bar
//     borderBottomWidth: 1,
//     borderBottomColor: '#D1D5DB', // Still keep a subtle border
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#FFFFFF', // White text for header title
//   },
//   mainContent: {
//     flex: 1, // Ensures it takes full height between header and bottom nav
//     padding: 15,
//     backgroundColor: '#FFFFFF', // White background for the content area
//   },
//   contentHeader: {
//     marginBottom: 20,
//   },
//   contentTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   subTitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 10,
//   },
//   contentHeaderActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   searchContainer: {
//     flex: 1,
//     marginRight: 10,
//   },
//   searchInput: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 5,
//     fontSize: 14,
//   },
//   loading: {
//     marginVertical: 20,
//   },
//   errorText: {
//     color: '#DC2626',
//     fontSize: 16,
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#4B5563',
//     fontSize: 16,
//     marginTop: 20,
//   },
//   userCard: {
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   userCardContent: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#2563EB',
//     marginBottom: 5,
//   },
//   userDetail: {
//     fontSize: 14,
//     color: '#1F2937',
//     marginBottom: 3,
//   },
//   label: {
//     fontWeight: '500',
//     color: '#4B5563',
//   },
// });

// export default PeoplePage;


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { fetchAllUsers } from '@/services/api';
import TopBar from '@/components/TopBar'; 

// Define User interface
interface User {
  _id: string;
  name: string;
  email: string;
  accessLevel: string; // Ensure this property exists and holds the access level
  status?: string;
  visaStatus?: string;
  employmentType?: string;
  training?: string;
}

// Dummy data for Training as it may not be in the user object
const getTrainingStatus = (email: string): string => {
  if (email.includes('example.com')) return 'Completed';
  if (email.includes('test.com')) return 'In Progress';
  return 'N/A';
};

const PeoplePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllUsers();
      const formattedUsers: User[] = res.data.map((user: any) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        accessLevel: user.access, // Ensure your API returns 'access' as the access level
        status: user.status,
        visaStatus: user.visaStatus,
        employmentType: user.employmentType,
        training: user.training || getTrainingStatus(user.email),
      }));
      setUsers(formattedUsers);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query and exclude admins
  const filteredUsers = users.filter(
    (user) =>
      user.accessLevel !== 'admin' && // <--- NEW CONDITION: Exclude admins
      (
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.accessLevel && user.accessLevel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
  );

  const renderUser = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardContent}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userDetail}>
          <Text style={styles.label}>Access: </Text>
          {user.accessLevel || 'N/A'}
        </Text>
        <Text style={styles.userDetail}>
          <Text style={styles.label}>Email: </Text>
          {user.email}
        </Text>
        <Text style={styles.userDetail}>
          <Text style={styles.label}>Training: </Text>
          {user.training || 'N/A'}
        </Text>
        <Text style={styles.userDetail}>
          <Text style={styles.label}>Visa Status: </Text>
          {user.visaStatus || 'N/A'}
        </Text>
        <Text style={styles.userDetail}>
          <Text style={styles.label}>Employment Type: </Text>
          {user.employmentType || 'N/A'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0061D0" />

      {/* TopBar is now used as the header */}
      <TopBar title="People" />

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Team Members</Text>
          <Text style={styles.subTitle}>
            Showing {filteredUsers.length} Out of {users.filter(u => u.accessLevel !== 'admin').length} Users
          </Text>
          <View style={styles.contentHeaderActions}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={styles.loading} />
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users found matching your search.</Text>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No users to display.</Text>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for the content area
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0, // Adjusted for safety
  },
  mainContent: {
    flex: 1, // Ensures it takes full height between header and bottom nav
    padding: 15,
    backgroundColor: '#FFFFFF', // White background for the content area
  },
  contentHeader: {
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  contentHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    fontSize: 14,
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 16,
    marginTop: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userCardContent: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 3,
  },
  label: {
    fontWeight: '500',
    color: '#4B5563',
  },
});

export default PeoplePage;
