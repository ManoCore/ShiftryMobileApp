// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Alert, // For simple alerts, consider custom modal for production
//   Platform,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker'; // For dropdown
// import DateTimePicker from '@react-native-community/datetimepicker'; // For date picker
// import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';
// import { submitLeaveApplication, fetchMyLeaveApplications } from '@/services/api'; // Import your API calls

// interface LeaveApplication {
//   _id: string;
//   userId: string;
//   leaveType: string;
//   startDate: string;
//   endDate: string;
//   reason: string;
//   status: 'pending' | 'approved' | 'rejected';
//   submittedAt: string;
// }

// export default function LeaveApplicationForm() {
//   const { user } = useAuth();

//   const [leaveType, setLeaveType] = useState('sick');
//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [reason, setReason] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const [myLeaveApplications, setMyLeaveApplications] = useState<LeaveApplication[]>([]);
//   const [loadingApplications, setLoadingApplications] = useState(true);
//   const [applicationsError, setApplicationsError] = useState('');

//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker] = useState(false);

//   const fetchApplications = useCallback(async () => {
//     if (!user?.id) return;
//     setLoadingApplications(true);
//     setApplicationsError('');
//     try {
//       const response = await fetchMyLeaveApplications(); // Assuming this fetches for the current user
//       setMyLeaveApplications(response.data);
//     } catch (err: any) {
//       console.error("Error fetching leave applications:", err.response?.data || err.message);
//       setApplicationsError('Failed to load your leave applications.');
//     } finally {
//       setLoadingApplications(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchApplications();
//   }, [fetchApplications]);

//   const handleSubmitLeave = useCallback(async () => {
//     if (!user?.id) {
//       setError('User not authenticated.');
//       return;
//     }
//     if (!leaveType || !startDate || !endDate || !reason.trim()) {
//       setError('Please fill in all fields.');
//       return;
//     }
//     if (startDate > endDate) {
//       setError('Start date cannot be after end date.');
//       return;
//     }

//     setIsSubmitting(true);
//     setMessage('');
//     setError('');

//     try {
//       const leaveData = {
//         userId: user.id,
//         leaveType,
//         startDate: startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
//         endDate: endDate.toISOString().split('T')[0],     // Format to YYYY-MM-DD
//         reason,
//       };
//       const response = await submitLeaveApplication(leaveData);

//       if (response.status === 201) { // Assuming 201 Created on success
//         setMessage('Leave application submitted successfully!');
//         setLeaveType('sick');
//         setStartDate(new Date());
//         setEndDate(new Date());
//         setReason('');
//         fetchApplications(); // Refresh the list of applications
//       } else {
//         setError(response.data?.message || 'Failed to submit leave application.');
//       }
//     } catch (err: any) {
//       const errMsg = err.response?.data?.message || 'Network error or server unavailable.';
//       setError(errMsg);
//       console.error('Leave submission error:', err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [user, leaveType, startDate, endDate, reason, fetchApplications]);

//   const onDateChange = (event: any, selectedDate?: Date) => {
//     const currentDate = selectedDate || startDate;
//     setShowStartDatePicker(Platform.OS === 'ios');
//     setShowEndDatePicker(Platform.OS === 'ios'); // Close picker on Android immediately
//     if (showStartDatePicker) {
//       setStartDate(currentDate);
//     } else if (showEndDatePicker) {
//       setEndDate(currentDate);
//     }
//   };

//   const showPicker = (pickerType: 'start' | 'end') => {
//     if (pickerType === 'start') {
//       setShowStartDatePicker(true);
//     } else {
//       setShowEndDatePicker(true);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.sectionTitle}>Apply for Leave</Text>

//       <Text style={styles.label}>Leave Type:</Text>
//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={leaveType}
//           onValueChange={(itemValue: React.SetStateAction<string>) => setLeaveType(itemValue)}
//           style={styles.picker}
//         >
//           <Picker.Item label="Sick Leave" value="sick" />
//           <Picker.Item label="Casual Leave" value="casual" />
//           <Picker.Item label="Annual Leave" value="annual" />
//           <Picker.Item label="Maternity Leave" value="maternity" />
//           <Picker.Item label="Paternity Leave" value="paternity" />
//           <Picker.Item label="Bereavement Leave" value="bereavement" />
//           <Picker.Item label="Unpaid Leave" value="unpaid" />
//         </Picker>
//       </View>

//       <Text style={styles.label}>Start Date:</Text>
//       <TouchableOpacity onPress={() => showPicker('start')} style={styles.dateInputButton}>
//         <Text style={styles.dateInputText}>{startDate.toLocaleDateString()}</Text>
//         <Ionicons name="calendar-outline" size={20} color="#007bff" />
//       </TouchableOpacity>
//       {showStartDatePicker && (
//         <DateTimePicker
//           testID="startDatePicker"
//           value={startDate}
//           mode="date"
//           display="default"
//           onChange={onDateChange}
//         />
//       )}

//       <Text style={styles.label}>End Date:</Text>
//       <TouchableOpacity onPress={() => showPicker('end')} style={styles.dateInputButton}>
//         <Text style={styles.dateInputText}>{endDate.toLocaleDateString()}</Text>
//         <Ionicons name="calendar-outline" size={20} color="#007bff" />
//       </TouchableOpacity>
//       {showEndDatePicker && (
//         <DateTimePicker
//           testID="endDatePicker"
//           value={endDate}
//           mode="date"
//           display="default"
//           onChange={onDateChange}
//         />
//       )}

//       <Text style={styles.label}>Reason:</Text>
//       <TextInput
//         style={styles.textarea}
//         multiline
//         numberOfLines={4}
//         value={reason}
//         onChangeText={setReason}
//         placeholder="Reason for leave"
//       />

//       {message ? <Text style={styles.messageText}>{message}</Text> : null}
//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleSubmitLeave}
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.submitButtonText}>Submit Application</Text>
//         )}
//       </TouchableOpacity>

//       <View style={styles.applicationsSection}>
//         <Text style={styles.sectionTitle}>My Leave Applications</Text>
//         {loadingApplications ? (
//           <ActivityIndicator size="small" color="#007bff" />
//         ) : applicationsError ? (
//           <Text style={styles.errorText}>{applicationsError}</Text>
//         ) : myLeaveApplications.length === 0 ? (
//           <Text style={styles.emptyText}>No leave applications found.</Text>
//         ) : (
//           myLeaveApplications.map((app) => (
//             <View key={app._id} style={styles.applicationCard}>
//               <Text style={styles.applicationType}>{app.leaveType.toUpperCase()} Leave</Text>
//               <Text style={styles.applicationDates}>
//                 {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
//               </Text>
//               <Text style={styles.applicationReason}>{app.reason}</Text>
//               <Text style={[styles.applicationStatus, styles[`status_${app.status}`]]}>
//                 Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
//               </Text>
//               <Text style={styles.applicationSubmitted}>
//                 Submitted: {new Date(app.submittedAt).toLocaleDateString()}
//               </Text>
//             </View>
//           ))
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#333',
//     marginBottom: 5,
//     marginTop: 10,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 5,
//     marginBottom: 15,
//     overflow: 'hidden', // Ensures picker content stays within bounds
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//   },
//   dateInputButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15,
//   },
//   dateInputText: {
//     fontSize: 16,
//     color: '#1F2937',
//   },
//   textarea: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 5,
//     padding: 10,
//     fontSize: 16,
//     color: '#1F2937',
//     marginBottom: 15,
//     textAlignVertical: 'top', // For multiline TextInput
//   },
//   messageText: {
//     color: 'green',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   errorText: {
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   submitButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   applicationsSection: {
//     marginTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     paddingTop: 20,
//   },
//   applicationCard: {
//     backgroundColor: '#F9FAFB',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   applicationType: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#007bff',
//     marginBottom: 5,
//   },
//   applicationDates: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 3,
//   },
//   applicationReason: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 5,
//   },
//   applicationStatus: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   status_pending: {
//     color: '#F59E0B', // Amber
//   },
//   status_approved: {
//     color: '#10B981', // Green
//   },
//   status_rejected: {
//     color: '#EF4444', // Red
//   },
//   applicationSubmitted: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 5,
//     textAlign: 'right',
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#4B5563',
//     fontSize: 14,
//     marginTop: 10,
//   },
// });


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert, // For simple alerts, consider custom modal for production
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For dropdown
import DateTimePicker from '@react-native-community/datetimepicker'; // For date picker
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { submitLeaveApplication, fetchMyLeaveApplications } from '@/services/api'; // Import your API calls

interface LeaveApplication {
  _id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function LeaveApplicationForm() {
  const { user } = useAuth();

  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState(''); // Corrected: Initialized with useState
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [myLeaveApplications, setMyLeaveApplications] = useState<LeaveApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [applicationsError, setApplicationsError] = useState('');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    setLoadingApplications(true);
    setApplicationsError('');
    try {
      const response = await fetchMyLeaveApplications(); // Assuming this fetches for the current user
      // Ensure response.data is an array before setting the state
      setMyLeaveApplications(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Error fetching leave applications:", err.response?.data || err.message);
      setApplicationsError('Failed to load your leave applications.');
      setMyLeaveApplications([]); // Ensure it's an empty array on error
    } finally {
      setLoadingApplications(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSubmitLeave = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated.');
      return;
    }
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const leaveData = {
        userId: user.id,
        leaveType,
        startDate: startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // Format to YYYY-MM-DD
        reason,
      };
      const response = await submitLeaveApplication(leaveData);

      if (response.status === 201) { // Assuming 201 Created on success
        setMessage('Leave application submitted successfully!');
        setLeaveType('sick');
        setStartDate(new Date());
        setEndDate(new Date());
        setReason('');
        fetchApplications(); // Refresh the list of applications
      } else {
        setError(response.data?.message || 'Failed to submit leave application.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Network error or server unavailable.';
      setError(errMsg);
      console.error('Leave submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, leaveType, startDate, endDate, reason, fetchApplications]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setShowEndDatePicker(Platform.OS === 'ios'); // Close picker on Android immediately
    if (showStartDatePicker) {
      setStartDate(currentDate);
    } else if (showEndDatePicker) {
      setEndDate(currentDate);
    }
  };

  const showPicker = (pickerType: 'start' | 'end') => {
    if (pickerType === 'start') {
      setShowStartDatePicker(true);
    } else {
      setShowEndDatePicker(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Apply for Leave</Text>

      <Text style={styles.label}>Leave Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={leaveType}
          onValueChange={(itemValue) => setLeaveType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Sick Leave" value="sick" />
          <Picker.Item label="Casual Leave" value="casual" />
          <Picker.Item label="Annual Leave" value="annual" />
          <Picker.Item label="Maternity Leave" value="maternity" />
          <Picker.Item label="Paternity Leave" value="paternity" />
          <Picker.Item label="Bereavement Leave" value="bereavement" />
          <Picker.Item label="Unpaid Leave" value="unpaid" />
        </Picker>
      </View>

      <Text style={styles.label}>Start Date:</Text>
      <TouchableOpacity onPress={() => showPicker('start')} style={styles.dateInputButton}>
        <Text style={styles.dateInputText}>{startDate.toLocaleDateString()}</Text>
        <Ionicons name="calendar-outline" size={20} color="#007bff" />
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>End Date:</Text>
      <TouchableOpacity onPress={() => showPicker('end')} style={styles.dateInputButton}>
        <Text style={styles.dateInputText}>{endDate.toLocaleDateString()}</Text>
        <Ionicons name="calendar-outline" size={20} color="#007bff" />
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Reason:</Text>
      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={4}
        value={reason}
        onChangeText={setReason}
        placeholder="Reason for leave"
      />

      {message ? <Text style={styles.messageText}>{message}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitLeave}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Application</Text>
        )}
      </TouchableOpacity>

      <View style={styles.applicationsSection}>
        <Text style={styles.sectionTitle}>My Leave Applications</Text>
        {loadingApplications ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : applicationsError ? (
          <Text style={styles.errorText}>{applicationsError}</Text>
        ) : myLeaveApplications.length === 0 ? (
          <Text style={styles.emptyText}>No leave applications found.</Text>
        ) : (
          myLeaveApplications.map((app) => (
            <View key={app._id} style={styles.applicationCard}>
              <Text style={styles.applicationType}>{app.leaveType.toUpperCase()} Leave</Text>
              <Text style={styles.applicationDates}>
                {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.applicationReason}>{app.reason}</Text>
              <Text style={[styles.applicationStatus, styles[`status_${app.status}`]]}>
                Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Text>
              <Text style={styles.applicationSubmitted}>
                Submitted: {new Date(app.submittedAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden', // Ensures picker content stays within bounds
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 15,
    textAlignVertical: 'top', // For multiline TextInput
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
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  applicationsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  applicationCard: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicationType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  applicationDates: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  applicationReason: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  applicationStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status_pending: {
    color: '#F59E0B', // Amber
  },
  status_approved: {
    color: '#10B981', // Green
  },
  status_rejected: {
    color: '#EF4444', // Red
  },
  applicationSubmitted: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 14,
    marginTop: 10,
  },
});
