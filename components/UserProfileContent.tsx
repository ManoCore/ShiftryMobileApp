import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // For picking images
import { updateUserProfile } from '@/services/api'; // Assuming this API call
import { useAuth } from '../context/AuthContext'; // Import useAuth!
import { Ionicons } from '@expo/vector-icons';



export default function UserProfileContent() {
  const { user, updateUser } = useAuth(); // Get user and updateUser from AuthContext

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null); // Stores image picker result
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      // If user has a profile picture URL, you might want to display it
      // but selectedImage is for new uploads, so no need to set it from user.profilePicture
    }
  }, [user]);

  const pickImage = useCallback(async () => {
    // Request media library permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]); // Use assets array for multiple selection or single asset
      setMessage('');
      setError('');
    }
  }, []);

  const handleProfileUpdate = useCallback(async () => {
    setIsUpdating(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    if (selectedImage) {
      // Append the image file for multipart/form-data upload
      // The 'uri' is the local file path, 'name' is the filename, 'type' is mime type
      const filename = selectedImage.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`; // Basic mime type inference

      formData.append('profilePicture', {
        uri: selectedImage.uri,
        name: filename,
        type: type,
      } as any); // Type assertion needed for FormData.append with Blob/File in RN
    }
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);

    try {
      const response = await updateUserProfile(formData); // Assuming updateUserProfile handles FormData
      setIsUpdating(false);

      if (response.status === 200) {
        setMessage(response.data.message || 'Profile updated successfully!');
        updateUser(response.data.user); // Update user in AuthContext with fresh data
        setSelectedImage(null); // Clear selected image after successful upload
      } else {
        setError(response.data?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setIsUpdating(false);
      const errMsg = err.response?.data?.message || 'Network error or server unavailable.';
      setError(errMsg);
      console.error('Profile update error:', err);
    }
  }, [firstName, lastName, selectedImage, updateUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>User Profile</Text>

      {user?.profilePicture && !selectedImage ? (
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profilePicture}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      ) : selectedImage ? (
        <Image
          source={{ uri: selectedImage.uri }}
          style={styles.profilePicture}
        />
      ) : (
        <View style={styles.placeholderPicture}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        </View>
      )}

      <TouchableOpacity onPress={pickImage} style={styles.chooseFileButton} disabled={isUpdating}>
        <Text style={styles.chooseFileButtonText}>Choose Profile Picture</Text>
      </TouchableOpacity>
      {selectedImage && <Text style={styles.selectedFileName}>{selectedImage.fileName || selectedImage.uri.split('/').pop()}</Text>}


      <Text style={styles.label}>First Name:</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        editable={!isUpdating}
      />

      <Text style={styles.label}>Last Name:</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        editable={!isUpdating}
      />

      {message ? <Text style={styles.messageText}>{message}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleProfileUpdate}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Update Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for the content
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  placeholderPicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooseFileButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  chooseFileButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedFileName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 15,
  },
  messageText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
