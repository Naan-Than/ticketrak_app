import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { addTicket, addOfflineTicket } from '../../store/slice/ticketSlice';
import { firestore } from '../../services/firebase';
import CustomAppBar from '../../components/common/CustomAppBar';
import { ToastMessage } from '../../constants/TostMessages';
import { offlineTicketSync } from '../../services/offlineTicketSync';
import CustomDocumentPicker from '../../components/common/CustomDocumentPicker';


interface User {
    uid: string;
    name: string;
    email: string;
    mobileNumber: string;
}

const CreateTicketScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(false);
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [usersList, setUsersList] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [clearDocs, setClearDocs] = useState(false);


    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? false);
        });
        fetchUsers();
        offlineTicketSync.start();
        return () => {
            unsubscribe();
            offlineTicketSync.stop();
        };
    }, []);

    const uploadToCloudinary = async (file: any) => {
        const data = new FormData();
        data.append('file', { uri: file.uri, type: file.type, name: file.name });
        data.append('upload_preset', 'YOUR_UPLOAD_PRESET');
        const res = await fetch(`https://api.cloudinary.com/v1_1/dd5vkjuor/auto/upload`, {
            method: 'POST',
            body: data,
        });

        const result = await res.json();
        return result.secure_url; // ✅ public URL
    };

    const handleManualSync = async () => {
        const status = offlineTicketSync.getSyncStatus();
        if (status.offlineCount === 0) {
            ToastMessage.Custom('info', 'No offline tickets to sync');
            return;
        }
        if (!isOnline) {
            ToastMessage.Custom('error', 'No internet connection', 'Please connect to the internet to sync tickets');
            return;
        }
        await offlineTicketSync.syncOfflineTickets();
    };
    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const usersSnapshot = await firestore().collection('users').get();
            const users: User[] = usersSnapshot.docs.map(doc => ({
                uid: doc.id,
                name: doc.data().name,
                email: doc.data().email,
            })).filter(user => user.uid !== userData?.uid);
            setUsersList(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAssigneeChange = (text: string) => {
        setAssignedTo(text);
        if (text.trim().length > 0) {
            const filtered = usersList.filter(
                user =>
                    user.name.toLowerCase().includes(text.toLowerCase()) ||
                    user.email.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredUsers(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
            setSelectedUser(null);
        }
    };

    const selectUser = (user: User) => {
        setSelectedUser(user);
        setAssignedTo(user.name);
        setShowSuggestions(false);
    };

    const priorities = [
        { value: 'low', label: 'Low', color: '#4CAF50' },
        { value: 'medium', label: 'Medium', color: '#FF9800' },
        { value: 'high', label: 'High', color: '#FF5722' },
        { value: 'urgent', label: 'Urgent', color: '#F44336' },
    ];

    const validateTitle = (text: string) => {
        setTitle(text);
        if (text && text.trim().length < 5) {
            setTitleError('Title must be at least 5 characters');
        } else {
            setTitleError('');
        }
    };

    const validateDescription = (text: string) => {
        setDescription(text);
        if (text && text.trim().length < 10) {
            setDescriptionError('Description must be at least 10 characters');
        } else {
            setDescriptionError('');
        }
    };

    const generateTicketId = () => {
        return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    };

    const handleCreateTicket = async () => {
        if (!title.trim()) {
            setTitleError('Title is required');
            return;
        }
        if (!description.trim()) {
            setDescriptionError('Description is required');
            return;
        }
        if (titleError || descriptionError) return;

        const ticketId = generateTicketId();
        const now = new Date().toISOString();
        setLoading(true);

        try {
            let uploadedFiles: any[] = [];

            if (files && files.length > 0) {
                const uploadPromises = files.map(async (file) => {
                    try {
                        const data = new FormData();
                        data.append('file', {
                            uri: file.uri,
                            type: file.type,
                            name: file.name,
                        });
                        data.append('upload_preset', 'ticket_uploads');
                        const res = await fetch(
                            'https://api.cloudinary.com/v1_1/dd5vkjuor/auto/upload',
                            { method: 'POST', body: data }
                        );
                        const result = await res.json();

                        return {
                            name: file.name,
                            type: file.type,
                            url: result.secure_url,
                        };
                    } catch (err) {
                        console.error('File upload failed:', err);
                        return null;
                    }
                });
                const results = await Promise.all(uploadPromises);
                console.log('Uploaded files:::::::', results);
                uploadedFiles = results.filter(Boolean);
            }

            const ticketData = {
                id: ticketId,
                title: title.trim(),
                description: description.trim(),
                status: 'open',
                priority,
                attachments: uploadedFiles,
                createdDate: now,
                updatedDate: now,
                assignedUser: selectedUser
                    ? {
                        uid: selectedUser.uid || 'unknown',
                        name: selectedUser.name || 'Unknown',
                        email: selectedUser.email || '',
                        phone: selectedUser.mobileNumber || '',
                    }
                    : usersList?.[0]
                        ? {
                            uid: usersList[0].uid || 'unknown',
                            name: usersList[0].name || 'Unknown',
                            email: usersList[0].email || '',
                            phone: usersList[0].mobileNumber || '',
                        }
                        : {
                            uid: null, name: null, email: null, phone: null,
                        },
                createdBy: {
                    uid: userData?.uid || 'unknown',
                    name: userData?.name || 'Unknown User',
                    email: userData?.email || 'unknown@example.com',
                    phone: userData?.mobileNumber || 'NA',
                },
                contactInfo: {
                    name: userData?.name || 'Unknown User',
                    email: userData?.email || '',
                    phone: userData?.mobileNumber || '',
                },
                conversation: uploadedFiles,
                isOffline: !isOnline,
                syncStatus: isOnline ? 'synced' : 'pending',
            };

            if (isOnline) {
                await firestore().collection('tickets').doc(ticketId).set(ticketData);
                dispatch(addTicket(ticketData));
                ToastMessage.Custom('success', 'Ticket Created Successfully.');
            } else {
                dispatch(addOfflineTicket(ticketData));
                ToastMessage.Custom(
                    'error',
                    'Offline Mode',
                    'Ticket saved locally. It will be synced when you are online.'
                );
            }
            setTitle('');
            setDescription('');
            setPriority('medium');
            setAssignedTo('');
            setSelectedUser(null);
            setFiles([]);
            setFiles([]);
            setClearDocs(true);
            setTimeout(() => setClearDocs(false), 100);
        } catch (error) {
            console.error('Create ticket error:', error);
            ToastMessage.Custom('error', 'Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <CustomAppBar title='Create Ticket' showBack={false} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {!isOnline && (
                    <View style={styles.offlineBanner}>
                        <Icon name="cloud-off" size={20} color="#F57C00" style={{ marginRight: 8 }} />
                        <Text style={styles.offlineBannerText}>You are offline</Text>
                    </View>
                )}
                {isOnline && useSelector((state: any) => state.ticket.offlineTickets.length) > 0 && (
                    <View style={styles.syncBanner}>
                        <Icon name="sync" size={20} color="#2196F3" style={{ marginRight: 8 }} />
                        <Text style={styles.syncBannerText}>
                            {useSelector((state: any) => state.ticket.offlineTickets.length)} ticket(s) pending sync
                        </Text>
                        <TouchableOpacity onPress={handleManualSync} style={styles.syncButton}>
                            <Text style={styles.syncButtonText}>Sync Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.formContainer}>
                    {/* Title */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>
                            Title <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[styles.inputContainer, titleError && styles.inputError]}>
                            <Icon name="title" size={22} color="#FFD700" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter ticket title"
                                placeholderTextColor="#999"
                                value={title}
                                onChangeText={validateTitle}
                                autoCapitalize="sentences"
                            />
                        </View>
                        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
                    </View>

                    {/* Description */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>
                            Description <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer, descriptionError && styles.inputError]}>
                            <Icon name="description" size={22} color="#FFD700" style={[styles.inputIcon, styles.textAreaIcon]} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your issue in detail..."
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={validateDescription}
                                multiline
                                numberOfLines={8}
                                textAlignVertical="top"
                                autoCapitalize="sentences"
                            />
                        </View>
                        {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>
                            Priority <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.priorityGrid}>
                            {priorities.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[
                                        styles.priorityRadio,
                                        priority === item.value && styles.priorityRadioActive,
                                    ]}
                                    onPress={() => setPriority(item.value as any)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.radioButton}>
                                        <View style={[
                                            styles.radioOuter,
                                            priority === item.value && { borderColor: '#FFD700', }
                                        ]}>
                                            {priority === item.value && (
                                                <View style={[styles.radioInner, { backgroundColor: '#FFD700', }]} />
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.priorityInfo}>
                                        <Text style={[
                                            styles.priorityLabel,
                                            priority === item.value && { color: '#c1a401ff', fontWeight: '700' }
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>
                            Attachments <Text style={styles.required}>*</Text>
                        </Text>
                        <CustomDocumentPicker onChange={(selectedFiles) => setFiles(selectedFiles)} clear={clearDocs} />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Assign To (Optional)</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="person" size={22} color="#FFD700" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Search by name or email..."
                                placeholderTextColor="#999"
                                value={assignedTo}
                                onChangeText={handleAssigneeChange}
                                autoCapitalize="none"
                            />
                            {selectedUser && (
                                <TouchableOpacity onPress={() => {
                                    setAssignedTo('');
                                    setSelectedUser(null);
                                }}>
                                    <Icon name="close" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {showSuggestions && (
                            <View style={styles.suggestionsContainer}>
                                {loadingUsers ? (
                                    <ActivityIndicator color="#FFD700" style={{ padding: 15 }} />
                                ) : (
                                    <FlatList
                                        data={filteredUsers}
                                        // scrollEnabled={false}
                                        keyExtractor={(item) => item.uid}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.suggestionItem}
                                                onPress={() => selectUser(item)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.userAvatar}>
                                                    <Text style={styles.userAvatarText}>
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={styles.userInfo}>
                                                    <Text style={styles.userName}>{item.name}</Text>
                                                    <Text style={styles.userEmail}>{item.email}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        style={styles.suggestionsList}
                                        keyboardShouldPersistTaps="handled"
                                    />
                                )}
                            </View>
                        )}
                        <Text style={styles.helperText}>
                            {selectedUser ? `Assigned to ${selectedUser.name}` : 'Leave blank for auto-assignment'}
                        </Text>
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        style={[styles.createButton, (loading || !title || !description) && styles.buttonDisabled]}
                        onPress={handleCreateTicket}
                        disabled={loading || !title || !description}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" size="small" />
                        ) : (
                            <>
                                <Text style={styles.createButtonText}>
                                    {isOnline ? 'Create Ticket' : 'Save Offline'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    offlineBanner: {
        backgroundColor: '#FFF3E0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    offlineBannerText: {
        color: '#E65100',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    formContainer: {
        backgroundColor: '#FFF',
        margin: 20,
        marginTop: 20,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    inputWrapper: {
        marginBottom: 28,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    required: {
        color: '#FF5252',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 58,
        borderWidth: 2,
        borderColor: '#F0F0F0',
    },
    inputError: {
        borderColor: '#FF5252',
        backgroundColor: '#FFF5F5',
    },
    textAreaContainer: {
        height: 160,
        alignItems: 'flex-start',
        paddingTop: 6,
        paddingBottom: 16,
    },
    textAreaIcon: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: '500',
    },
    textArea: {
        height: 128,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    helperText: {
        color: '#666',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    priorityGrid: {
        gap: 12,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    priorityRadio: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        width: '48%',

        borderColor: '#F0F0F0',
    },
    priorityRadioActive: {
        backgroundColor: '#FFFBF0',
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    radioButton: {
        marginRight: 14,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    priorityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    priorityInfo: {
        flex: 1,
    },
    priorityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    suggestionsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionsList: {
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: '#666',
    },
    createButton: {
        backgroundColor: '#FFD700',
        height: 58,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#E8E8E8',
        shadowOpacity: 0,
    },
    createButtonText: {
        color: '#000',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    syncBanner: {
        backgroundColor: '#E3F2FD',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    syncBannerText: {
        color: '#1976D2',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    syncButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    syncButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
});

export default CreateTicketScreen;