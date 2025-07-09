import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, SafeAreaView, StatusBar, TouchableOpacity,
  TextInput, FlatList, StyleSheet, Animated, Platform, Dimensions,
  Modal, ActivityIndicator, Image, Pressable, ScrollView,Button
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext'; 
import {
  fetchAllPosts, fetchImportantPosts, fetchYourPosts,
  createPost, toggleLikePost, addCommentToPost, deletePost,
} from '@/services/api';

import TopBar from '@/components/TopBar';


const { width: screenWidth } = Dimensions.get('window');

const getFirstName = (fullName: string | null | undefined) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  return parts.length > 0 ? parts[0] : '';
};

export default function NewsfeedPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all'|'important'|'your'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States for Create Post Modal
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLocation, setNewPostLocation] = useState(''); // For location input
  const [isImportant, setIsImportant] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // For file attachments

  // States for Comment Modal
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string|null>(null);
  const [currentCommentText, setCurrentCommentText] = useState('');

  // States for custom Alert/Confirm Modals
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState('');
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const confirmActionRef = useRef<(() => void) | null>(null); // To store the action for confirmation

  // Loading and Error states for posts
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const sidebarAnim = useRef(new Animated.Value(-screenWidth)).current;

  // Animation for sidebar
  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: sidebarOpen ? 0 : -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen]);

  // Helper to get user ID from the useAuth context
  const getUserId = useCallback((): string | null => {
    return user?.id || null;
  }, [user]);

  // Fetch posts based on active tab
  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const userId = getUserId(); // Get userId from the useCallback helper
      let res: any = null; // Initialize res to null or undefined
      if (activeTab === 'all') {
        res = await fetchAllPosts();
      } else if (activeTab === 'important') {
        res = await fetchImportantPosts();
      } else if (activeTab === 'your') {
        if (!userId) { // Check if userId is available for 'your' posts
          setPostsError('Please log in to view your posts.');
          setPosts([]);
          return;
        }
        res = await fetchYourPosts(userId);
      }
      
      // Safely access res.data
      if (res && res.data) {
        setPosts(res.data); // Ensure data is an array
      } else {
        setPosts([]); // If no data, set to empty array
      }
    } catch (err: any) {
      console.error('Error loading posts:', err.response?.data || err.message);
      setPostsError('Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [activeTab, getUserId]);

    useEffect(() => {
    if (!authLoading) { // Only attempt to load posts once auth status is known
      loadPosts();
    }
  }, [activeTab, authLoading, user, loadPosts]);

  // Function to show custom alert
  const showCustomAlert = (title: string, message: string) => {
    setAlertModalTitle(title);
    setAlertModalMessage(message);
    setAlertModalVisible(true);
  };

  // Function to show custom confirmation
  const showCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    confirmActionRef.current = onConfirm;
    setConfirmModalVisible(true);
  };

  // Handle liking/unliking a post
  async function handleLike(postId: string, currentLikes: number, likedBy: string[]) {
    const userId = getUserId();
    if (!userId) { // Check if userId is available
      showCustomAlert('Not Logged In', 'Please log in to like posts.');
      return;
    }
    try {
      // Optimistic update
      const isLiked = likedBy.includes(userId);
      const newLikedBy = isLiked ? likedBy.filter((id: string) => id !== userId) : [...likedBy, userId];
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

      setPosts(prevPosts =>
        prevPosts.map(p =>
          p._id === postId ? { ...p, likes: newLikes, likedBy: newLikedBy } : p
        )
      );

      await toggleLikePost(postId, userId);
    } catch (err: any) {
      console.error('Error toggling like:', err.response?.data || err.message);
      showCustomAlert('Error', 'Failed to toggle like. Please try again.');
      loadPosts(); // Revert on error
    }
  }

  // Handle adding a comment
  async function handleAddComment() {
    if (!currentCommentText.trim()) {
      showCustomAlert('Error', 'Please enter a comment.');
      return;
    }
    const userId = getUserId();
    if (!userId) { // Check if userId is available
      showCustomAlert('Not Logged In', 'Please log in to add comments.');
      return;
    }
    if (!commentingPostId) return;

    const newComment = {
      user: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous',
      text: currentCommentText,
      userId: userId,
      date: new Date().toISOString(), // Add date for comment
    };

    try {
      // Optimistic update
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p._id === commentingPostId
            ? {
                ...p,
                commentsList: p.commentsList ? [...p.commentsList, newComment] : [newComment],
                comments: (p.comments || 0) + 1,
              }
            : p
        )
      );
      setCurrentCommentText(''); // Clear input
      setCommentsModalVisible(false); // Close modal

      await addCommentToPost(commentingPostId, { userId: userId, commentText: newComment.text });
    } catch (err: any) {
      console.error('Error adding comment:', err.response?.data || err.message);
      showCustomAlert('Error', 'Failed to add comment. Please try again.');
      loadPosts(); // Revert on error
    }
  }

  // Handle deleting a post
  async function handleDelete(postId: string, authorId: string) {
    const userId = getUserId();
    if (!userId) { // Check if userId is available
      showCustomAlert('Not Logged In', 'Please log in to delete posts.');
      return;
    }
    // Only author, admin, or manager can delete
    if (userId !== authorId && user?.role !== 'admin' && user?.role !== 'manager') {
      showCustomAlert('Unauthorized', 'You do not have permission to delete this post.');
      return;
    }

    showCustomConfirm(
      'Confirm Deletion',
      'Are you sure you want to delete this post?',
      async () => {
        try {
          // Optimistic update
          setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
          await deletePost(postId);
        } catch (err: any) {
          console.error('Error deleting post:', err.response?.data || err.message);
          showCustomAlert('Error', 'Failed to delete post. Please try again.');
          loadPosts(); // Revert on error
        }
      }
    );
  }

  // Handle creating a new post
  async function submitPost() {
    if (!newPostContent.trim()) {
      showCustomAlert('Error', 'Please enter post content.');
      return;
    }
    const userId = getUserId();
    if (!userId) { // Check if userId is available
      showCustomAlert('Not Logged In', 'Please log in to create a post.');
      return;
    }

    // You would typically handle file uploads here
    // For now, `files` will be an empty array or contain mock data
    const filesToUpload = selectedFiles.map(file => file.name); // Placeholder for file names

    try {
      await createPost({
        author: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous',
        authorId: userId,
        authorProfilePicture: user?.profilePicture,
        location: newPostLocation || 'General', // Use selected location or default
        content: newPostContent,
        isImportant: isImportant,
        allowComments: true, // Hardcoded for now, add UI if needed
        requireConfirmation: false, // Hardcoded for now, add UI if needed
        files: filesToUpload, // Pass file names/URIs to backend
      });
      setNewPostContent('');
      setNewPostLocation('');
      setIsImportant(false);
      setSelectedFiles([]); // Clear selected files
      setCreatePostModalVisible(false);
      loadPosts(); // Reload posts to show the new one
    } catch (err: any) {
      console.error('Error creating post:', err.response?.data || err.message);
      showCustomAlert('Error', 'Failed to create post. Please try again.');
    }
  }

  // Placeholder for file picking (requires expo-image-picker, expo-document-picker)
  const handleFilePick = async () => {
    // try {
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.All,
    //     allowsMultipleSelection: true,
    //     quality: 1,
    //   });
    //   if (!result.canceled) {
    //     setSelectedFiles(result.assets); // result.assets contains array of {uri, type, fileName, etc.}
    //   }
    // } catch (error) {
    //   console.error("Error picking image:", error);
    //   showCustomAlert("Error", "Failed to pick files.");
    // }

    // For now, just show an alert
    showCustomAlert("Feature Coming Soon", "File attachment functionality will be implemented using Expo's ImagePicker and DocumentPicker.");
  };

  // Get the current post object for the comments modal
  const currentPostForComments = commentingPostId
    ? posts.find(p => p._id === commentingPostId)
    : null;

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  // Main component render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0061D0" />

      {/* Header */}
      <TopBar title="News Feed" />
      <View style={styles.headerIcon}>
        <Button
          title="Add Post"
          onPress={() => setCreatePostModalVisible(true)}
          color="#007BFF"
        />
      </View>

      {/* Post List */}
      {postsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : postsError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{postsError}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.flatListContent} 
          contentContainerStyle={styles.list}
          data={posts}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Author Info */}
              <View style={styles.authorInfo}>
                <Image
                  source={{ uri: item.authorProfilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
                  style={styles.profilePicture}
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
                <View style={styles.authorTextContainer}>
                  <Text style={styles.authorName}>
                    {item.authorId === user?.id ? (
                      <Text style={styles.boldText}>{getFirstName(user?.firstName)}</Text>
                    ) : (
                      <Text style={styles.boldText}>{getFirstName(item.author)}</Text>
                    )}
                    <Text style={styles.postMeta}> from {item.location || 'Unknown'} - {new Date(item.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
                  </Text>
                  {item.isImportant && (
                    <View style={styles.importantTag}>
                      <Text style={styles.importantText}>Important</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Post Content */}
              <Text style={styles.content}>{item.content}</Text>

              {/* File Attachments Placeholder (Implement with ImagePicker/DocumentPicker) */}
              {item.files && item.files.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  <Text style={styles.attachmentHeader}>Attachments:</Text>
                  {item.files.map((file: any, index: number) => (
                    <Text key={index} style={styles.attachmentText}>
                      {/* You'll need to render actual images/videos/PDF icons here */}
                      {file} (placeholder)
                    </Text>
                  ))}
                </View>
              )}

              {/* Actions (Like, Comment, Delete) */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleLike(item._id, item.likes, item.likedBy)} style={styles.actionButton}>
                  <Ionicons name={item.likedBy?.includes(user?.id) ? "heart" : "heart-outline"} size={18} color={item.likedBy?.includes(user?.id) ? "#E53935" : "#007bff"} />
                  <Text style={styles.stat}>{item.likes || 0}</Text>
                </TouchableOpacity>

                {item.allowComments !== false && ( // Only show if comments are allowed (default true)
                  <TouchableOpacity onPress={() => { setCommentingPostId(item._id); setCommentsModalVisible(true); }} style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={18} color="#007bff" />
                    <Text style={styles.stat}>{item.comments || 0}</Text>
                  </TouchableOpacity>
                )}

                {(item.authorId === user?.id || user?.role === 'admin' || user?.role === 'manager') && (
                  <TouchableOpacity onPress={() => handleDelete(item._id, item.authorId)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <Text style={styles.sidebarHeader}>NEWSFEED</Text>
        {['all','important','your'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => { setActiveTab(type as any); setSidebarOpen(false); }}
            style={activeTab === type ? styles.activeTab : styles.tab}
          >
            <Text style={activeTab === type ? styles.activeText : styles.tabText}>
              {type === 'all' ? 'All Posts' : type === 'important' ? 'Important Posts' : 'Your Posts'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      {sidebarOpen && <TouchableOpacity style={styles.overlay} onPress={() => setSidebarOpen(false)} />}

      {/* Create Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createPostModalVisible}
        onRequestClose={() => setCreatePostModalVisible(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TextInput
              placeholder="What's Happening?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              style={styles.textarea}
            />
            <TextInput
              placeholder="Location (e.g., General, Office A)"
              value={newPostLocation}
              onChangeText={setNewPostLocation}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleFilePick} style={styles.attachmentButton}>
              <Ionicons name="attach" size={20} color="#0061D0" />
              <Text style={styles.attachmentButtonText}>Attach Files (Images, Videos, PDFs)</Text>
            </TouchableOpacity>
            {selectedFiles.length > 0 && (
              <View style={styles.selectedFilesContainer}>
                {selectedFiles.map((file, index) => (
                  <Text key={index} style={styles.selectedFileText}>{file.name}</Text>
                ))}
              </View>
            )}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() => setIsImportant(!isImportant)}
              >
                <Ionicons
                  name={isImportant ? "checkbox-outline" : "square-outline"}
                  size={20}
                  color={isImportant ? "#0061D0" : "#666"}
                />
                <Text style={styles.checkboxText}>Mark as Important</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={submitPost} style={styles.postBtn}>
              <Text style={styles.postBtnText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreatePostModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentsModalVisible}
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comments</Text>
            <ScrollView style={styles.commentsList}>
              {currentPostForComments?.commentsList?.length > 0 ? (
                currentPostForComments.commentsList.map((comment: any, index: number) => (
                  <View key={index} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{comment.user}</Text>
                    <Text style={styles.commentTextContent}>{comment.text}</Text>
                    <Text style={styles.commentDate}>{new Date(comment.date).toLocaleString()}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noCommentsText}>No comments yet.</Text>
              )}
            </ScrollView>
            {currentPostForComments?.allowComments !== false && (
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="Add a comment..."
                  value={currentCommentText}
                  onChangeText={setCurrentCommentText}
                />
                <TouchableOpacity onPress={handleAddComment} style={styles.sendCommentButton}>
                  <Ionicons name="send" size={24} color="#0061D0" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={() => setCommentsModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <Pressable style={styles.centeredView} onPress={() => setAlertModalVisible(false)}>
          <View style={styles.alertModalView} onStartShouldSetResponder={() => true}>
            <Text style={styles.alertModalTitle}>{alertModalTitle}</Text>
            <Text style={styles.alertModalText}>{alertModalMessage}</Text>
            <Pressable
              style={styles.alertButton}
              onPress={() => setAlertModalVisible(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <Pressable style={styles.centeredView} onPress={() => setConfirmModalVisible(false)}>
          <View style={styles.alertModalView} onStartShouldSetResponder={() => true}>
            <Text style={styles.alertModalTitle}>{confirmModalTitle}</Text>
            <Text style={styles.alertModalText}>{confirmModalMessage}</Text>
            <View style={styles.confirmButtonsContainer}>
              <Pressable
                style={[styles.alertButton, styles.confirmButtonCancel]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.alertButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.alertButton, styles.confirmButtonOK]}
                onPress={() => {
                  if (confirmActionRef.current) {
                    confirmActionRef.current();
                  }
                  setConfirmModalVisible(false);
                }}
              >
                <Text style={styles.alertButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Changed to white
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  header: {
    height: 60,
    backgroundColor: '#0061D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerIcon: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18, // Adjusted for better readability
    fontWeight: 'bold',
  },
  flatListContent: { // New style for FlatList to take full height
    flex: 1,
    backgroundColor: '#f0f2f5', // Background for the scrollable area
  },
  list: {
    padding: 12,
    paddingBottom: 20, // Add some padding at the bottom for scrolling
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  authorTextContainer: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  postMeta: {
    color: '#666',
    fontSize: 11,
    marginLeft: 4,
  },
  importantTag: {
    backgroundColor: '#E53935', // Red color for important
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start', // Align to content
    marginTop: 4,
  },
  importantText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  attachmentsContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  attachmentHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  attachmentText: {
    fontSize: 12,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  commentsList: {
    maxHeight: 150, // Limit height for scrollable comments
    marginBottom: 10,
    paddingRight: 5, // For scrollbar visibility
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
  },
  commentTextContent: {
    fontSize: 13,
    color: '#555',
  },
  commentDate: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'right',
  },
  noCommentsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  stat: {
    marginLeft: 4,
    color: '#007bff',
    fontSize: 13,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20, // Rounded input for comments
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendCommentButton: {
    padding: 5,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: screenWidth * 0.7, // 70% of screen width
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60, // Adjusted for safety
    paddingHorizontal: 14,
    zIndex: 20,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sidebarHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  activeTab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0061D0',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10, // Below sidebar, above main content
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 30, // Above everything else
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: '80%', // Limit modal height
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  textarea: {
    minHeight: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    textAlignVertical: 'top', // For multiline TextInput
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0061D0',
    borderRadius: 6,
    justifyContent: 'center',
  },
  attachmentButtonText: {
    marginLeft: 8,
    color: '#0061D0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedFilesContainer: {
    marginBottom: 12,
  },
  selectedFileText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute items
    marginBottom: 15,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  postBtn: {
    backgroundColor: '#0061D0',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  postBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    color: '#0061D0',
    fontSize: 15,
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  // Custom Alert/Confirm Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertModalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxWidth: 350,
  },
  alertModalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  alertModalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
  },
  alertButton: {
    borderRadius: 6,
    padding: 10,
    elevation: 2,
    minWidth: 80,
    backgroundColor: '#0061D0',
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButtonCancel: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  confirmButtonOK: {
    backgroundColor: '#E53935', // Red for delete confirmation
  },
});
