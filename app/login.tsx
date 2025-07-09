// import { useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   Platform,
// } from 'react-native';
// import { loginUser } from '@/services/api'; // ✅ adjust this import if path differs
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface LoginProps {
//   onLoginSuccess?: () => void;
//   onSignUpPress?: () => void;
// }

// const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSignUpPress }) => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const router = useRouter();


//   // const handleLogin = async () => {
//   //   if (!email || !password) {
//   //     Alert.alert('Login Error', 'Please enter both email and password.');
//   //     return;
//   //   }

//   //   try {
//   //     const response = await loginUser({ email, password });

//   //     // Assuming your backend returns a token
//   //     const token = response.data.token;
//   //     if (token) {
//   //       // ✅ Store token securely (use expo-secure-store in production)
//   //       await AsyncStorage.setItem('token', token);

//   //       Alert.alert('Login Successful', 'Welcome back!');
//   //       if (onLoginSuccess) onLoginSuccess();
//   //     }
//   //   } catch (error: any) {
//   //     console.error('Login failed:', error);
//   //     const errorMessage =
//   //       error.response?.data?.message || 'An error occurred during login.';
//   //     Alert.alert('Login Failed', errorMessage);
//   //   }
//   // };
//   const handleLogin = async () => {
//   if (!email || !password) {
//     Alert.alert('Login Error', 'Please enter both email and password.');
//     return;
//   }

//   try {
//     const response = await loginUser({ emailId: email, password });

//     const token = response.data.token;
//     if (token) {
//       await AsyncStorage.setItem('token', token);
//       Alert.alert('Login Success', 'You are now logged in!');
//       onLoginSuccess?.(); // Navigate to next screen
//     } else {
//       Alert.alert('Login Failed', 'No token received from server.');
//     }
//     router.replace('/(tabs)');

//   } catch (error: any) {
//     console.error('Login failed:', error);
//     Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials.');
//   }
// };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.title}>Login</Text>
//           <Text style={styles.subtitle}>Welcome back. Enter your credentials.</Text>

//           <Text style={styles.label}>Email Address</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter your email"
//             placeholderTextColor="#888"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={email}
//             onChangeText={setEmail}
//           />

//           <Text style={styles.label}>Password</Text>
//           <View style={styles.passwordContainer}>
//             <TextInput
//               style={styles.passwordInput}
//               placeholder="Enter your password"
//               placeholderTextColor="#888"
//               secureTextEntry={!showPassword}
//               value={password}
//               onChangeText={setPassword}
//             />
//             <TouchableOpacity
//               onPress={() => setShowPassword(!showPassword)}
//               style={styles.showHideButton}
//             >
//               <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//             <Text style={styles.loginButtonText}>Login</Text>
//           </TouchableOpacity>

//           <View style={styles.signUpContainer}>
//             <Text style={styles.signUpText}>Don't have an account? </Text>
//             <TouchableOpacity onPress={onSignUpPress}>
//               <Text style={styles.signUpLink}>Sign up here</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// // export default Login;


// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#3478F6', // Blue background for the entire screen
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 15, // Rounded corners for the card
//     padding: 30,
//     width: '100%',
//     maxWidth: 400, // Max width for larger screens/tablets
//     elevation: 8, // Android shadow
//     shadowColor: '#000', // iOS shadow
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//     textAlign: 'left', // Align title to left as per image
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 25,
//     textAlign: 'left', // Align subtitle to left
//   },
//   label: {
//     fontSize: 15,
//     color: '#333',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 20,
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   passwordInput: {
//     flex: 1,
//     padding: 12,
//     fontSize: 16,
//     color: '#333',
//   },
//   showHideButton: {
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//   },
//   showHideText: {
//     color: '#007bff', // Blue color for "Show/Hide"
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   loginButton: {
//     backgroundColor: '#007bff', // Blue button
//     borderRadius: 8,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   signUpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   signUpText: {
//     fontSize: 15,
//     color: '#666',
//   },
//   signUpLink: {
//     fontSize: 15,
//     color: '#007bff', // Blue link
//     fontWeight: 'bold',
//   },
// });

// export default Login;

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal, // Import Modal for custom alert
  Pressable, // Import Pressable for modal close button
} from 'react-native';
import { loginUser } from '@/services/api'; // Adjust this import if path differs
import AsyncStorage from '@react-native-async-storage/async-storage';
// Consider using expo-secure-store for more secure token storage in production:
// import * as SecureStore from 'expo-secure-store';

interface LoginProps {
  onLoginSuccess?: () => void;
  onSignUpPress?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSignUpPress }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [modalVisible, setModalVisible] = useState<boolean>(false); // State for custom modal visibility
  const [modalTitle, setModalTitle] = useState<string>(''); // State for custom modal title
  const [modalMessage, setModalMessage] = useState<string>(''); // State for custom modal message

  const router = useRouter();

  // Function to show the custom alert modal
  const showCustomAlert = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert('Login Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true); // Start loading
    try {
      // Note: Your loginUser API expects { emailId: email, password }
      const response = await loginUser({ emailId: email, password });

      const token = response.data.token;
      if (token) {
        // Store token securely. For production, consider expo-secure-store.
        await AsyncStorage.setItem('token', token);
        // await SecureStore.setItemAsync('token', token); // Use this for SecureStore

        showCustomAlert('Login Success', 'You are now logged in!');
        // The onLoginSuccess prop might become redundant if router.replace is always used.
        // If you intend to use it for other logic, keep it, otherwise, router.replace handles navigation.
        onLoginSuccess?.();
        router.replace('/(drawer)/dashboard'); // Navigate to the main tabs screen
      } else {
        showCustomAlert('Login Failed', 'No token received from server.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials or network error.';
      showCustomAlert('Login Failed', errorMessage);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Welcome back. Enter your credentials.</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading} // Disable input when loading
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading} // Disable input when loading
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showHideButton}
              disabled={loading} // Disable button when loading
            >
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading} // Disable login button when loading
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging In...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUpPress} disabled={loading}>
              <Text style={styles.signUpLink}>Sign up here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <Pressable style={styles.centeredView} onPress={() => setModalVisible(false)}>
          <View style={styles.modalView} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3478F6', // Blue background for the entire screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15, // Rounded corners for the card
    padding: 30,
    width: '100%',
    maxWidth: 400, // Max width for larger screens/tablets
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'left', // Align title to left as per image
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'left', // Align subtitle to left
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  showHideButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  showHideText: {
    color: '#007bff', // Blue color for "Show/Hide"
    fontSize: 15,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#007bff', // Blue button
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
    color: '#666',
  },
  signUpLink: {
    fontSize: 15,
    color: '#007bff', // Blue link
    fontWeight: 'bold',
  },
  // Custom Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Make modal responsive
    maxWidth: 350,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 100,
  },
  buttonClose: {
    backgroundColor: '#007bff',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Login;
