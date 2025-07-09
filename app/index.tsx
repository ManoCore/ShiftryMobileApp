import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 50); // short delay allows layout to mount
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
