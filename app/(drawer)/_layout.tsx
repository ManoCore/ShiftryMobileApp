// app/_layout.tsx or app/(drawer)/_layout.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Drawer } from 'expo-router/drawer';
import { AuthProvider } from '../../context/AuthContext';

export default function DrawerLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Drawer
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: '#007bff',
            drawerStyle: {
              backgroundColor: '#f0f0f0',
              marginTop:40 // ← Change this to your desired color
            },
          }}
        >
          <Drawer.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Drawer.Screen name="newsfeed" options={{ title: 'News Feed' }} />
          <Drawer.Screen name="schedule" options={{ title: 'Schedule' }} />
          <Drawer.Screen name="location" options={{ title: 'Locations' }} />
          <Drawer.Screen name="peoplepage" options={{ title: 'People' }} />
        </Drawer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
