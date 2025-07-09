// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import TopBar from '@/components/TopBar';
// import { fetchMyAssignedShifts } from '@/services/api';
// import { parseISO, format } from 'date-fns';

// type Schedule = {
//   _id: string;
//   description?: string;
//   date: string;
//   start: string;
//   end: string;
//   location: { name: string } | string;
// };

// export default function ScheduleScreen() {
//   const [schedules, setSchedules] = useState<Schedule[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadSchedules = async () => {
//       try {
//         setLoading(true);
//         const response = await fetchMyAssignedShifts();
//         setSchedules(response.data || []);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching schedules:', err);
//         setError('Failed to load schedules. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSchedules();
//   }, []);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <TopBar title="Schedule" />
//       <ScrollView contentContainerStyle={styles.container}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#007bff" />
//         ) : error ? (
//           <Text style={styles.errorText}>{error}</Text>
//         ) : schedules.length === 0 ? (
//           <Text>No assigned schedules found.</Text>
//         ) : (
//           schedules.map((schedule) => (
//             <View key={schedule._id} style={styles.scheduleCard}>
//               <Text style={styles.title}>{schedule.description || 'Shift'}</Text>
//               <Text>Date: {format(parseISO(schedule.date), 'MMM dd, yyyy')}</Text>
//               <Text>Start: {schedule.start}</Text>
//               <Text>End: {schedule.end}</Text>
//               <Text>
//                 Location:{' '}
//                 {typeof schedule.location === 'object' ? schedule.location.name : schedule.location}
//               </Text>
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: 'white',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   container: {
//     padding: 16,
//   },
//   scheduleCard: {
//     backgroundColor: '#f0f0f0',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//   },
//   title: {
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   errorText: {
//     color: 'red',
//     textAlign: 'center',
//   },
// });


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import TopBar from '@/components/TopBar';
import { fetchMyAssignedShifts } from '@/services/api';
import { parseISO, format } from 'date-fns';

type Schedule = {
  _id: string;
  description?: string;
  date: string;
  start: string;
  end: string;
  location: { name: string } | string;
};

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetchMyAssignedShifts();
        setSchedules(response.data || []);
      } catch (err) {
        console.error('Error loading schedules:', err);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, []);

  const renderScheduleCard = (schedule: Schedule) => {
    const date = format(parseISO(schedule.date), 'MMM dd, yyyy');
    const location =
      typeof schedule.location === 'object' ? schedule.location.name : schedule.location;

    return (
      <View key={schedule._id} style={styles.innerBox}>
        <Text style={styles.scheduleText}>📍 {location}</Text>
        <Text style={styles.scheduleText}>📅 {date}</Text>
        <Text style={styles.scheduleText}>🕒 {schedule.start} - {schedule.end}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Schedules" />
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
        ) : schedules.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 Shifts</Text>
            {schedules.map(renderScheduleCard)}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🛫 Time Off</Text>
            <Text style={styles.emptyText}>You have no assigned shifts.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  innerBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
