import React, { useState } from 'react';
import { View, FlatList, Alert, Text } from 'react-native';
import { 
  Appbar, FAB, Title, Paragraph, Button, TextInput, 
  ProgressBar, Portal, Modal, Subheading, Chip, List, 
  Divider, Caption, IconButton 
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData, styles, theme } from '../_layout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// This component is defined locally to ensure it doesn't cause issues.
const EmptyState = ({ icon, message }) => (
  <View style={styles.emptyStateContainer}>
    {/* Corrected Color: Using a safe hardcoded value to prevent crashes */}
    <Icon name={icon} size={64} color="#BDBDBD" /> 
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const AddTaskModal = ({ visible, onDismiss, onAddTask, courseId }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('REVISION');
  const [estimatedTime, setEstimatedTime] = useState('');

  const handleAddTask = () => {
    if (title.trim() && estimatedTime.trim() && !isNaN(estimatedTime)) {
      onAddTask({ courseId, title, type, estimatedTime: parseInt(estimatedTime, 10) });
      setTitle(''); 
      setType('REVISION'); 
      setEstimatedTime(''); 
      onDismiss();
    } else { 
      Alert.alert("Validation Error", "Please fill in all fields correctly."); 
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Title>Add New Task</Title>
        <TextInput 
          label="Task Title" 
          value={title} 
          onChangeText={setTitle} 
          style={styles.input} 
          mode="outlined" 
        />
        <TextInput 
          label="Estimated Time (minutes)" 
          value={estimatedTime} 
          onChangeText={setEstimatedTime} 
          keyboardType="numeric" 
          style={styles.input} 
          mode="outlined" 
        />
        <Subheading>Task Type</Subheading>
        <View style={styles.chipContainer}>
          {['REVISION', 'ASSIGNMENT', 'PROJECT', 'TEST'].map(t => (
            <Chip 
              key={t} 
              icon={type === t ? 'check' : ''} 
              selected={type === t} 
              onPress={() => setType(t)} 
              style={styles.chip}
            >
              {t}
            </Chip>
          ))}
        </View>
        <View style={styles.buttonGroup}>
          <Button onPress={onDismiss} style={styles.button}>Cancel</Button>
          <Button onPress={handleAddTask} mode="contained" style={styles.button}>Add Task</Button>
        </View>
      </Modal>
    </Portal>
  );
};

const CourseHeader = ({ course }) => {
    const { tasks } = useData();
    const courseTasks = tasks.filter(t => t.courseId === course.id);
    const completedTasks = courseTasks.filter(t => t.isCompleted);
    const totalMinutes = courseTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const completedMinutes = completedTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const progress = totalMinutes > 0 ? completedMinutes / totalMinutes : 0;

    return (
        <>
            <View style={styles.detailHeader}>
                <Title style={styles.detailTitle}>{course.name}</Title>
                <Paragraph style={styles.detailInstructor}>{course.instructor}</Paragraph>
            </View>
            <View style={styles.detailProgressContainer}>
                <Subheading>Overall Progress</Subheading>
                <ProgressBar progress={progress} color={theme.colors.primary} style={{ height: 8, borderRadius: 4 }} />
                <Caption style={{ textAlign: 'right' }}>{completedMinutes} of {totalMinutes} minutes completed</Caption>
            </View>
            <Divider />
            {/* Corrected Title: Using List.Subheader to display the title */}
            <List.Subheader>Tasks</List.Subheader>
        </>
    );
};

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getCourseById, tasks, updateTask, deleteTask, addTask, deleteCourse } = useData();
  const course = getCourseById(id);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  
  if (!course) { 
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
        </Appbar.Header>
        <EmptyState icon="alert-circle-outline" message="Course not found." />
      </View>
    );
  }

  const courseTasks = tasks.filter(t => t.courseId === id);
  
  const handleDeleteCourse = () => {
    Alert.alert(
      "Delete Course", 
      `Are you sure you want to delete ${course.name}?`,
      [
        { text: "Cancel" }, 
        { text: "Delete", style: "destructive", onPress: () => { 
          deleteCourse(id); 
          router.back(); 
        }}
      ]
    );
  };

  const toggleTaskCompletion = (task) => {
    updateTask({ ...task, isCompleted: !task.isCompleted });
  };

  const renderTaskItem = ({ item }) => (
    <List.Item
      title={item.title}
      description={`${item.type} - ${item.estimatedTime} mins`}
      style={styles.taskItem}
      left={() => (
        <List.Icon 
          icon={item.isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} 
        />
      )}
      right={() => (
        <IconButton 
          icon="delete" 
          color={theme.colors.error}
          onPress={() => deleteTask(item.id)} 
        />
      )}
      onPress={() => toggleTaskCompletion(item)}
      titleStyle={{ textDecorationLine: item.isCompleted ? 'line-through' : 'none' }}
    />
  );

  return (
    <View style={styles.detailContainer}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={course.name} />
        <Appbar.Action icon="delete" onPress={handleDeleteCourse} />
      </Appbar.Header>

      <FlatList
        data={courseTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        ListHeaderComponent={<CourseHeader course={course} />}
        ListEmptyComponent={<EmptyState icon="format-list-checks" message="No tasks yet." />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      />

      <AddTaskModal 
        visible={taskModalVisible} 
        onDismiss={() => setTaskModalVisible(false)} 
        onAddTask={addTask} 
        courseId={id} 
      />
      <FAB 
        style={styles.fab} 
        icon="plus" 
        label="Add Task" 
        onPress={() => setTaskModalVisible(true)} 
      />
    </View>
  );
}
