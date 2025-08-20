import React, { useState } from 'react';
import { View, ScrollView, Alert, Text } from 'react-native';
import { Appbar, FAB, Card, Title, Paragraph, Button, TextInput, Portal, Modal, Subheading, Chip, Colors } from 'react-native-paper';
import { useData, styles, theme } from '../_layout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AddTimetableModal = ({ visible, onDismiss, onAddEntry }) => {
    const { courses } = useData();
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [day, setDay] = useState('Monday');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const handleAdd = () => {
        if (selectedCourseId && day && startTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/) && endTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
            const course = courses.find(c => c.id === selectedCourseId);
            const newEntry = { courseId: selectedCourseId, courseName: course.name, day, startTime, endTime };
            onAddEntry(day, newEntry);
            onDismiss();
        } else { Alert.alert("Validation Error", "Please fill all fields correctly (HH:MM format for time)."); }
    };
    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <Title>Add Class to Timetable</Title>
                <Subheading>Select Course</Subheading>
                <View style={styles.chipContainer}>
                    {courses.map(c => (<Chip key={c.id} selected={selectedCourseId === c.id} onPress={() => setSelectedCourseId(c.id)} style={styles.chip}>{c.name}</Chip>))}
                </View>
                <Subheading>Select Day</Subheading>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <Chip key={d} selected={day === d} onPress={() => setDay(d)} style={styles.chip}>{d}</Chip>
                    ))}
                </ScrollView>
                <TextInput label="Start Time (HH:MM)" value={startTime} onChangeText={setStartTime} style={styles.input} mode="outlined" />
                <TextInput label="End Time (HH:MM)" value={endTime} onChangeText={setEndTime} style={styles.input} mode="outlined" />
                <View style={styles.buttonGroup}>
                    <Button onPress={onDismiss} style={styles.button}>Cancel</Button>
                    <Button onPress={handleAdd} mode="contained" style={styles.button}>Add</Button>
                </View>
            </Modal>
        </Portal>
    );
};

export default function TimetableScreen() {
    const { timetable, addTimetableEntry, deleteTimetableEntry, courses } = useData();
    const [modalVisible, setModalVisible] = useState(false);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const handleDelete = (day, entryId) => {
        Alert.alert("Delete Entry", "Are you sure you want to remove this class?",
            [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteTimetableEntry(day, entryId) }]
        );
    };
    return (
        <View style={styles.container}>
            <Appbar.Header><Appbar.Content title="Weekly Timetable" /></Appbar.Header>
            <ScrollView style={styles.timetableContainer}>
                {days.map(day => (
                    <View key={day}>
                        <Text style={styles.dayHeader}>{day}</Text>
                        {timetable[day]?.length > 0 ? (
                            timetable[day].map(entry => (
                                <Card key={entry.id} style={styles.timeSlot} onLongPress={() => handleDelete(day, entry.id)}>
                                    <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View>
                                            <Title style={{ fontSize: 16 }}>{entry.courseName}</Title>
                                            <Paragraph style={{ fontSize: 14 }}>{`${entry.startTime} - ${entry.endTime}`}</Paragraph>
                                        </View>
                                        <Icon name="calendar-clock" size={24} color={theme.colors.primary} />
                                    </Card.Content>
                                </Card>
                            ))
                        ) : ( <Text style={{ marginLeft: 8, color: '#9E9E9E' }}>No classes scheduled.</Text> )}
                    </View>
                ))}
            </ScrollView>
             <AddTimetableModal visible={modalVisible} onDismiss={() => setModalVisible(false)} onAddEntry={addTimetableEntry} />
            <FAB style={styles.fab} icon="plus" label="Add Class"
                onPress={() => {
                    if (courses.length > 0) { setModalVisible(true); }
                    else { Alert.alert("No Courses", "Please add a course first."); }
                }}
            />
        </View>
    );
}
