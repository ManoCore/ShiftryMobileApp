import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';

import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
// Import fetchSchedulesInRange as it's likely the supported backend endpoint
import { fetchSchedulesInRange, fetchMyLeaveApplications } from '@/services/api';
// You might need to install date-fns if not already present: npm install date-fns date-fns-tz
import { format, parseISO, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import TopBar from '@/components/TopBar';

export default function DashboardHome() {
  // Define types for better type safety and clarity, reflecting backend response structure
  type Schedule = {
    _id: string;
    description?: string; // Corresponds to 'title' in your frontend display
    date: string; // YYYY-MM-DD format
    start: string; // HH:mm format
    end: string; // HH:mm format
    location?: { name: string } | string; // Can be an object or just a string ID
    careWorker?: Array<{ _id: string; firstName: string; lastName: string } | string> | { _id: string; firstName: string; lastName: string } | string;
    isPublished?: boolean;
    break?: number;
  };

  type Shift = { // Type for display in the 'My Shifts' card
    _id: string;
    title: string;
    date: string;
    status: string;
  };

  type Leave = {
    _id: string;
    reason: string;
    status: string;
  };

  type OpenScheduleDisplay = { // Type for display in the 'Open Schedules' card
    id: string;
    title: string;
    start: string;
    end: string;
    location: string;
    date: string;
    breakDuration?: string;
    status: string;
  };

  // State for data
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [openSchedules, setOpenSchedules] = useState<OpenScheduleDisplay[]>([]);

  // State for loading and errors
  const [loadingShifts, setLoadingShifts] = useState<boolean>(true);
  const [loadingLeaves, setLoadingLeaves] = useState<boolean>(true);
  const [loadingOpenSchedules, setLoadingOpenSchedules] = useState<boolean>(true);
  const [shiftsError, setShiftsError] = useState<string | null>(null);
  const [leavesError, setLeavesError] = useState<string | null>(null);
  const [openSchedulesError, setOpenSchedulesError] = useState<string | null>(null);

  // Placeholder for user and loading state (replace with actual AuthContext/Redux/Zustand)
  // In a real app, you'd get this from your AuthContext:
  // const { user, isLoading: isUserLoading } = useAuth();
  const [user, setUser] = useState<any>({ id: 'someUserId', role: 'careWorker' }); // Mock user for testing
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false); // Mock loading state

  const handleMenuPress = () => {
    console.log("Menu button pressed in DashboardHome!");
    // In a real app, this would typically open a navigation drawer
  };

  const HEADER_COLOR = '#007bff'; // Consistent with safeArea background

  // Helper to get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDate = () => {
    const todayDate = toZonedTime(new Date(), 'Asia/Kolkata'); // Assuming IST timezone from your web app
    return format(todayDate, 'yyyy-MM-dd');
  };

  // Helper to get a future date (e.g., 1 year from now) in YYYY-MM-DD format
  const getFutureDate = (months: number) => {
    const futureDate = toZonedTime(new Date(), 'Asia/Kolkata');
    futureDate.setMonth(futureDate.getMonth() + months);
    return format(futureDate, 'yyyy-MM-dd');
  };

  // Function to determine schedule status, adapted from your web component
  const getScheduleStatus = (schedule: { date: string; start: string; end: string }): string => {
    if (!schedule.start || !schedule.end || !schedule.date) {
      return 'Unknown';
    }
    try {
      const timeZone = 'Asia/Kolkata';
      const currentTime = toZonedTime(new Date(), timeZone);
      const startDateTime = parseISO(`${schedule.date}T${schedule.start}:00`); // Parse with T for ISO format
      const endDateTime = parseISO(`${schedule.date}T${schedule.end}:00`);

      if (!startDateTime || !endDateTime || isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return 'Unknown';
      }

      const scheduleDateOnly = parseISO(schedule.date);
      const todayDateOnly = parseISO(getTodayDate());

      // If schedule date is before today (only date part)
      if (isBefore(scheduleDateOnly, todayDateOnly)) {
        return 'Completed';
      }

      // If it's today's date but the time has passed
      if (format(scheduleDateOnly, 'yyyy-MM-dd') === format(todayDateOnly, 'yyyy-MM-dd')) {
        if (isAfter(currentTime, endDateTime)) {
          return 'Completed';
        }
        if (isWithinInterval(currentTime, { start: startDateTime, end: endDateTime })) {
          return 'In Progress';
        }
        if (isBefore(currentTime, startDateTime)) {
          return 'Upcoming';
        }
      }

      // If it's a future date
      if (isAfter(scheduleDateOnly, todayDateOnly)) {
        return 'Upcoming';
      }

      return 'Unknown';
    } catch (e) {
      console.error(`Error deriving status for schedule:`, e);
      return 'Unknown';
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isUserLoading || !user) {
        // Wait for user data to load
        setLoadingShifts(true);
        setLoadingLeaves(true);
        setLoadingOpenSchedules(true);
        return;
      }

      // Fetch all schedules in a range first, then filter client-side
      setLoadingShifts(true);
      setLoadingOpenSchedules(true);
      setShiftsError(null);
      setOpenSchedulesError(null);
      try {
        const startFetchDate = getTodayDate();
        const endFetchDate = getFutureDate(12); // Fetch for next 12 months for open schedules

        const allSchedulesResponse = await fetchSchedulesInRange(startFetchDate, endFetchDate);
        const allFetchedSchedules: Schedule[] = allSchedulesResponse.data || [];

        // --- Filter for My Shifts (Assigned to current user, today or upcoming) ---
        const myFilteredShifts: Shift[] = allFetchedSchedules
          .filter(schedule => {
            const scheduleDateObj = parseISO(schedule.date);
            const todayDateObj = parseISO(getTodayDate());

            // Only future or today's schedules
            if (isBefore(scheduleDateObj, todayDateObj) && format(scheduleDateObj, 'yyyy-MM-dd') !== format(todayDateObj, 'yyyy-MM-dd')) {
              return false;
            }

            // Check if user is assigned to this schedule
            if (Array.isArray(schedule.careWorker)) {
              return schedule.careWorker.some(cw =>
                (typeof cw === 'object' && cw?._id === user.id) ||
                (typeof cw === 'string' && cw === user.id)
              );
            } else if (typeof schedule.careWorker === 'object') {
              return schedule.careWorker._id === user.id;
            } else if (typeof schedule.careWorker === 'string') {
              return schedule.careWorker === user.id;
            }
            return false; // Not assigned to current user
          })
          .map(schedule => ({
            _id: schedule._id,
            title: schedule.description || 'Shift',
            date: schedule.date,
            status: getScheduleStatus(schedule), // Get status for display
          }))
          .filter(shift => shift.status === 'Upcoming' || shift.status === 'In Progress'); // Only show upcoming/in progress in this card

        setShifts(myFilteredShifts);

        // --- Filter for Open Schedules (Not assigned, not published, today or future) ---
        const currentOpenSchedulesFiltered: OpenScheduleDisplay[] = allFetchedSchedules
          .filter(schedule => {
            const scheduleDateObj = parseISO(schedule.date);
            const todayDateObj = parseISO(getTodayDate());

            return (
              (scheduleDateObj >= todayDateObj) && // Only future or today's open schedules
              (!schedule.careWorker ||
                (Array.isArray(schedule.careWorker) && schedule.careWorker.length === 0)) &&
              schedule.isPublished === false // Explicitly check isPublished for truly open shifts
            );
          })
          .map(schedule => ({
            id: schedule._id,
            title: schedule.description || 'Open Shift',
            start: schedule.start || '',
            end: schedule.end || '',
            location: typeof schedule.location === 'object' ? schedule.location.name || 'Unknown' : schedule.location || 'Unknown',
            date: schedule.date,
            breakDuration: schedule.break ? `${schedule.break} mins` : '',
            status: getScheduleStatus(schedule),
          }));
        setOpenSchedules(currentOpenSchedulesFiltered);

      } catch (error: any) {
        console.error('Error fetching schedules:', error.response?.data || error.message);
        setShiftsError('Failed to load shifts. Please check your network or try again.');
        setOpenSchedulesError('Failed to load open schedules. Please try again.');
      } finally {
        setLoadingShifts(false);
        setLoadingOpenSchedules(false);
      }

      // --- Fetch Leaves (Existing logic, just wrapped with loading/error) ---
      setLoadingLeaves(true);
      setLeavesError(null);
      try {
        const response = await fetchMyLeaveApplications();
        // Access response.data.data because your API returns { data: [], success: true }
        if (response.data && Array.isArray(response.data.data)) {
          setLeaves(response.data.data);
        } else {
          console.warn("fetchMyLeaveApplications did not return an array in response.data.data:", response.data);
          setLeaves([]);
        }
      } catch (error: any) {
        console.error('Error fetching leaves:', error.response?.data || error.message);
        setLeavesError('Failed to load leave applications. Please try again.');
      } finally {
        setLoadingLeaves(false);
      }
    };

    fetchDashboardData();
  }, [user, isUserLoading]); // Re-run when user or user loading state changes

  // Helper to format time for display
  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      // Assuming time is in HH:mm format
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error("Error formatting time:", time, e);
      return time; // Return original if parsing fails
    }
  };

  if (isUserLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />

      <TopBar title="Dashboard" />


      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* My Shifts Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="event-available" size={20} color="#1F8E3D" />
            <Text style={styles.cardTitle}>My Shifts</Text>
          </View>
          {loadingShifts ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : shiftsError ? (
            <Text style={styles.errorText}>{shiftsError}</Text>
          ) : shifts.length > 0 ? (
            shifts.map((shift) => (
              <Text key={shift._id} style={styles.cardText}>
                {shift.title} on {format(parseISO(shift.date), 'MMM dd, yyyy')} ({shift.status})
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No upcoming shifts assigned to you.</Text>
          )}
        </View>

        {/* My Time Off Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Entypo name="aircraft-take-off" size={20} color="#00A2C3" />
            <Text style={styles.cardTitle}>My Time Off</Text>
          </View>
          {loadingLeaves ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : leavesError ? (
            <Text style={styles.errorText}>{leavesError}</Text>
          ) : leaves.length > 0 ? (
            leaves.map((leave) => (
              <Text key={leave._id} style={styles.cardText}>
                {leave.reason} - {leave.status}
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No leave applications found.</Text>
          )}
        </View>

        {/* Open Schedules Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="radio-button-on" size={20} color="#D000C3" />
            <Text style={styles.cardTitle}>Open Schedules</Text>
          </View>
          {loadingOpenSchedules ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : openSchedulesError ? (
            <Text style={styles.errorText}>{openSchedulesError}</Text>
          ) : openSchedules.length > 0 ? (
            openSchedules.map((schedule) => (
              <Text key={schedule.id} style={styles.cardText}>
                {schedule.title} ({formatTime(schedule.start)} - {formatTime(schedule.end)}) at {schedule.location}
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No open schedules available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F2FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F2FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    height: 60,
    backgroundColor: '#F4F2FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18, // Slightly larger for better readability
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  scrollArea: {
    padding: 16,
    paddingBottom: 80, // Ensure enough space at the bottom for scrolling
    backgroundColor: '#F4F2FA', // Light background for content area
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8, // Space between icon and title
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', // Darker color for titles
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4, // Smaller margin for list items
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
