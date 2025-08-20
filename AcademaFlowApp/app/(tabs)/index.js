import React, { useState, useContext } from 'react';
import { View, FlatList, TouchableOpacity, Alert, ScrollView, Text } from 'react-native';
import { Appbar, FAB, Card, Title, Paragraph, Button, TextInput, ProgressBar, Colors, Portal, Modal, Subheading, Chip, Caption } from 'react-native-paper';
import { Link } from 'expo-router';
import { useData, styles, theme } from '../_layout'; // Import shared context and styles
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Reusable Components that are specific to this screen or small
const EmptyState = ({ icon, message }) => (
  <View style={styles.emptyStateContainer}>
    <Icon name={icon} size={64} color="#BDBDBD" />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const CourseCard = ({ course }) => {
  const { tasks } = useData();
  const courseTasks = tasks.filter(t => t.courseId === course.id);
  const completedTasks = courseTasks.filter(t => t.isCompleted);
  const totalMinutes = courseTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
  const completedMinutes = completedTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
  const progress = totalMinutes > 0 ? completedMinutes / totalMinutes : 0;
  return (
    <Link href={`/course/${course.id}`} asChild>
        <TouchableOpacity>
        <Card style={styles.card}>
            <Card.Content>
            <View style={styles.cardContent}>
                <View>
                <Title>{course.name}</Title>
                <Paragraph>{course.instructor}</Paragraph>
                </View>
                <Icon name="chevron-right" size={24} />
            </View>
            <View style={styles.progressContainer}>
                <ProgressBar progress={progress} color={theme.colors.primary} />
                <Caption style={{textAlign: 'right'}}>{Math.round(progress * 100)}% Complete</Caption>
            </View>
            </Card.Content>
        </Card>
        </TouchableOpacity>
    </Link>
  );
};

const AddCourseModal = ({ visible, onDismiss, onAddCourse }) => {
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const handleAdd = () => {
    if (name.trim() && instructor.trim()) {
      onAddCourse({ name, instructor });
      setName(''); setInstructor(''); onDismiss();
    } else { Alert.alert("Validation Error", "Please fill in all fields."); }
  };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Title>Add New Course</Title>
        <TextInput label="Course Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
        <TextInput label="Instructor Name" value={instructor} onChangeText={setInstructor} style={styles.input} mode="outlined" />
        <View style={styles.buttonGroup}>
          <Button onPress={onDismiss} style={styles.button}>Cancel</Button>
          <Button onPress={handleAdd} mode="contained" style={styles.button}>Add</Button>
        </View>
      </Modal>
    </Portal>
  );
};

// Main Screen Component
export default function DashboardScreen() {
  const { courses, addCourse } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="AcademaFlow Dashboard" />
      </Appbar.Header>
      {courses.length > 0 ? (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (<CourseCard course={item} />)}
          contentContainerStyle={styles.content}
        />
      ) : ( <EmptyState icon="school" message="No courses yet. Add your first course!" /> )}
      <AddCourseModal visible={modalVisible} onDismiss={() => setModalVisible(false)} onAddCourse={addCourse} />
      <FAB style={styles.fab} icon="plus" onPress={() => setModalVisible(true)} />
    </View>
  );
}
