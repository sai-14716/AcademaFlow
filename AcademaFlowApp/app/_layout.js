import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- THEME AND STYLES ---
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
    placeholder: '#a9a9a9',
  },
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: theme.colors.primary },
  card: { marginBottom: 16, elevation: 4 },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressContainer: { marginTop: 8 },
  modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 },
  input: { marginBottom: 16 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  button: { marginLeft: 8 },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyStateText: { marginTop: 16, fontSize: 18, color: '#757575' },
  detailContainer: { flex: 1 },
  detailHeader: { padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  detailTitle: { fontSize: 28, fontWeight: 'bold' },
  detailInstructor: { fontSize: 16, color: '#616161', marginTop: 4 },
  detailProgressContainer: { padding: 16 },
  taskItem: { backgroundColor: theme.colors.surface, borderRadius: 8, marginVertical: 4 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { marginRight: 8, marginBottom: 8 },
  timetableContainer: { flex: 1, padding: 8 },
  dayHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, marginLeft: 8 },
  timeSlot: { backgroundColor: theme.colors.surface, borderRadius: 8, padding: 12, marginVertical: 4, elevation: 2 },
});

// --- DATA CONTEXT ---
export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timetable, setTimetable] = useState({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCourses = await AsyncStorage.getItem('courses');
        if (storedCourses) setCourses(JSON.parse(storedCourses));
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        const storedTimetable = await AsyncStorage.getItem('timetable');
        if (storedTimetable) setTimetable(JSON.parse(storedTimetable));
      } catch (e) { console.error("Failed to load data", e); }
    };
    loadData();
  }, []);

  const saveData = async (key, value) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.error("Failed to save data", e); }
  };

  useEffect(() => { saveData('courses', courses); }, [courses]);
  useEffect(() => { saveData('tasks', tasks); }, [tasks]);
  useEffect(() => { saveData('timetable', timetable); }, [timetable]);

  const addCourse = (course) => setCourses(prev => [...prev, { ...course, id: Date.now().toString() }]);
  const deleteCourse = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setTasks(prev => prev.filter(t => t.courseId !== courseId));
  };
  const addTask = (task) => setTasks(prev => [...prev, { ...task, id: Date.now().toString(), isCompleted: false }]);
  const updateTask = (updatedTask) => setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  const deleteTask = (taskId) => setTasks(prev => prev.filter(t => t.id !== taskId));
  const addTimetableEntry = (day, entry) => {
    setTimetable(prev => {
      const newDayEntries = [...(prev[day] || []), { ...entry, id: Date.now().toString() }];
      newDayEntries.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...prev, [day]: newDayEntries };
    });
  };
  const deleteTimetableEntry = (day, entryId) => {
    setTimetable(prev => ({ ...prev, [day]: prev[day].filter(e => e.id !== entryId) }));
  };

  const value = {
    courses, tasks, timetable, addCourse, deleteCourse, addTask, updateTask, deleteTask, addTimetableEntry, deleteTimetableEntry,
    getCourseById: (id) => courses.find(c => c.id === id),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);

// --- MAIN LAYOUT ---
export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <DataProvider>
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        </Stack>
      </DataProvider>
    </PaperProvider>
  );
}
