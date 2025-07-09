// import { View, Text } from 'react-native';
// import TopBar from '@/components/TopBar';

// export default function OpenSchedulesPage() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <TopBar></TopBar>
//       <Text>Open Schedules Page</Text>
//     </View>
//   );
// }


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView, // Added ScrollView for modal content
  Pressable,  // Added Pressable for modal backdrop
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons in the shift card
import { fetchSchedulesInRange, updateSchedule } from '@/services/api'; // Import your API calls
import TopBar from '../../components/TopBar'; // Adjust path as needed
import { useAuth } from '../../context/AuthContext'; // Import your AuthContext

// Define the structure of a raw schedule item from your API
interface RawSchedule {
  _id: string;
  client: {
    _id: string;
    name: string;
    address: string;
    // Add other client details as needed
  };
  startTime: string; // ISO string
  endTime: string; // ISO string
  isPublished: boolean;
  careWorker?: string; // Null if open
  // Add other schedule properties as needed
}

// Define the structure of a processed shift card
interface ShiftCard {
  id: string;
  clientName: string;
  clientAddress: string;
  date: string;
  timeRange: string;
  // Add any other processed data you want to display
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to get a future date in YYYY-MM-DD format
const getFutureDate = (days: number): string => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return futureDate.toISOString().split('T')[0];
};

// Helper to process raw schedule data into displayable shift cards
const processShiftData = (schedules: RawSchedule[], userId: string): ShiftCard[] => {
  return schedules.map(schedule => {
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);

    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

    return {
      id: schedule._id,
      clientName: schedule.client?.name || 'N/A Client',
      clientAddress: schedule.client?.address || 'N/A Address',
      date: start.toLocaleDateString('en-US', dateOptions),
      timeRange: `${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`,
    };
  });
};

export default function OpenSchedulesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [openShifts, setOpenShifts] = useState<ShiftCard[]>([]);
  const [loadingShifts, setLoadingShifts] = useState<boolean>(true);
  const [shiftsError, setShiftsError] = useState<string | null>(null);

  // States for the Join Work modal
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedShiftDetails, setSelectedShiftDetails] = useState<ShiftCard | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Function to show custom alert (similar to NewsfeedPage)
  const showCustomAlert = (title: string, message: string) => {
    // You'd typically use a custom modal for alerts in RN,
    // but for this example, we'll just log or use a simple state.
    console.log(`ALERT: ${title} - ${message}`);
    setConfirmMessage(message); // Using confirmMessage for simple display
  };


  const getSchedulesAndFilterOpen = useCallback(async () => {
    if (authLoading || !user) {
      if (!authLoading && !user) {
        setShiftsError("Please log in to view available shifts.");
        setLoadingShifts(false);
      }
      return;
    }

    try {
      setLoadingShifts(true);
      setShiftsError(null);

      const startDate = getTodayDate();
      const endDate = getFutureDate(30); // Fetch schedules for the next 30 days
      const response = await fetchSchedulesInRange(startDate, endDate);

      const allFetchedSchedules: RawSchedule[] = response.data;

      // Filter for open shifts: no careWorker assigned AND not published
      const openShiftsFiltered = allFetchedSchedules.filter(schedule =>
        !schedule.careWorker && schedule.isPublished === false
      );

      setOpenShifts(processShiftData(openShiftsFiltered, user.id));
      setLoadingShifts(false);
    } catch (err: any) {
      console.error("Failed to fetch open shifts:", err.response?.data || err.message);
      setShiftsError("Failed to load open shifts. Please try again.");
      setLoadingShifts(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    getSchedulesAndFilterOpen();
  }, [getSchedulesAndFilterOpen]); // Dependency on the memoized function


  const handleJoinWorkClick = (card: ShiftCard) => {
    setSelectedShiftDetails(card);
    setShowRulesModal(true);
    setAgreedToRules(false);
    setConfirmMessage('');
    setConfirmError('');
  };

  const handleConfirmJoin = async () => {
    if (!agreedToRules) {
      setConfirmError('You must agree to the rules to join the shift.');
      return;
    }
    if (!selectedShiftDetails || !user) {
      setConfirmError('Shift details or user information missing.');
      return;
    }

    setConfirmMessage('Joining shift...');
    setConfirmError('');

    try {
      // --- IMPORTANT: Replace with your actual API call to claim the shift ---
      // Example: Assuming you have an updateSchedule API that can assign a careWorker
      await updateSchedule(selectedShiftDetails.id, {
        careWorker: user.id,
        isPublished: true, // Or whatever status indicates it's claimed
      });

      setConfirmMessage('Shift joined successfully!');
      setShowRulesModal(false);
      // Refresh the list of open shifts after a successful join
      getSchedulesAndFilterOpen();
    } catch (error: any) {
      console.error("Failed to claim shift:", error.response?.data || error.message);
      setConfirmError('Failed to join shift. Please try again.');
    }
  };

  const renderShiftCard = ({ item: shift }: { item: ShiftCard }) => (
    <View style={styles.shiftCard}>
      <Text style={styles.shiftClientName}>{shift.clientName}</Text>
      <Text style={styles.shiftDetail}><Ionicons name="location-outline" size={14} color="#555" /> {shift.clientAddress}</Text>
      <Text style={styles.shiftDetail}><Ionicons name="calendar-outline" size={14} color="#555" /> {shift.date}</Text>
      <Text style={styles.shiftDetail}><Ionicons name="time-outline" size={14} color="#555" /> {shift.timeRange}</Text>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinWorkClick(shift)}
      >
        <Text style={styles.joinButtonText}>Join Work</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Open Schedules" />

      <View style={styles.mainContent}>
        <Text style={styles.pageTitle}>Available Shifts</Text>
        <Text style={styles.pageSubtitle}>Find and claim open shifts for your schedule.</Text>

        {loadingShifts ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#0061D0" />
            <Text style={styles.statusText}>Loading available shifts...</Text>
          </View>
        ) : shiftsError ? (
          <View style={styles.statusContainer}>
            <Text style={styles.errorText}>{shiftsError}</Text>
          </View>
        ) : openShifts.length === 0 ? (
          <View style={styles.statusContainer}>
            <Text style={styles.emptyText}>No open shifts available at the moment.</Text>
          </View>
        ) : (
          <FlatList
            data={openShifts}
            renderItem={renderShiftCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      {/* Rules and Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRulesModal}
        onRequestClose={() => setShowRulesModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowRulesModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={(event) => true}>
            <Text style={styles.modalTitle}>Work Rules & Confirmation</Text>
            <ScrollView style={styles.rulesScrollView}>
              <Text style={styles.rulesText}>
                Please read the following rules carefully before joining the shift:
                {'\n\n'}
                1.  **Commitment:** By joining this shift, you commit to completing it as scheduled.
                {'\n'}
                2.  **Punctuality:** Arrive at the client's location at least 10 minutes before the shift starts.
                {'\n'}
                3.  **Professionalism:** Maintain a professional demeanor and adhere to all company policies.
                {'\n'}
                4.  **Communication:** In case of any issues or delays, immediately inform your manager.
                {'\n'}
                5.  **Client Care:** Provide the highest standard of care to the client, following their care plan.
                {'\n'}
                6.  **Reporting:** Complete all necessary reports and documentation accurately and on time.
                {'\n\n'}
                Shift Details:
                {'\n'}
                Client: {selectedShiftDetails?.clientName}
                {'\n'}
                Address: {selectedShiftDetails?.clientAddress}
                {'\n'}
                Date: {selectedShiftDetails?.date}
                {'\n'}
                Time: {selectedShiftDetails?.timeRange}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToRules(!agreedToRules)}
            >
              <Ionicons
                name={agreedToRules ? "checkbox-outline" : "square-outline"}
                size={24}
                color={agreedToRules ? "#0061D0" : "#666"}
              />
              <Text style={styles.checkboxLabel}>I agree to the work rules</Text>
            </TouchableOpacity>

            {confirmError ? <Text style={styles.modalErrorText}>{confirmError}</Text> : null}
            {confirmMessage ? <Text style={styles.modalMessageText}>{confirmMessage}</Text> : null}

            <TouchableOpacity
              style={[styles.confirmButton, !agreedToRules && styles.confirmButtonDisabled]}
              onPress={handleConfirmJoin}
              disabled={!agreedToRules}
            >
              <Text style={styles.confirmButtonText}>Confirm Join</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRulesModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for the content area
  },
  mainContent: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F0F2F5', // Light gray background for the main content area
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
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
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  flatListContent: {
    paddingBottom: 20, // Add padding at the bottom of the list
  },
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  shiftClientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0061D0',
    marginBottom: 8,
  },
  shiftDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#28A745', // Green color for join
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  rulesScrollView: {
    width: '100%',
    marginBottom: 20,
    maxHeight: '60%', // Limit height of rules scroll area
  },
  rulesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  modalErrorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessageText: {
    color: '#0061D0',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#0061D0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#0061D0',
    fontSize: 16,
  },
});
