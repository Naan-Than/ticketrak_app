import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { firestore } from '../../services/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { getUserData } from '../../services/auth.service';
import { ToastMessage } from '../../constants/TostMessages';
import { setUserProfileData, setUserRole } from '../../store/slice/authSlice';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentProfile: {
        name: string;
        email: string;
        mobileNumber: string;
    };
    userId: string;
    onProfileUpdated: () => void;
}

const EditProfileModal: React.FC = ({
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [nameError, setNameError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();

    useEffect(() => {
        setName(userData.name);
        setEmail(userData.email);
        setMobileNumber(userData.mobileNumber);
    }, []);

    function openModel() {
        setShowModel(true)
        setNameError('');
        setMobileError('');
    }
    function closeModel() {
        setShowModel(false);
    }

    const validateName = (text: string) => {
        setName(text);
        if (text && text.trim().length < 2) {
            setNameError('Name must be at least 2 characters');
        } else {
            setNameError('');
        }
    };

    const validateMobile = (text: string) => {
        setMobileNumber(text);
        const mobileRegex = /^[0-9]{10}$/;
        if (text && !mobileRegex.test(text)) {
            setMobileError('Please enter a valid 10-digit mobile number');
        } else {
            setMobileError('');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setNameError('Name is required');
            return;
        }
        if (!mobileNumber.trim()) {
            setMobileError('Mobile number is required');
            return;
        }
        if (nameError || mobileError) {
            return;
        }

        try {
            setLoading(true);
            await firestore().collection('users').doc(userData?.uid).update({
                name: name.trim(),
                mobileNumber: mobileNumber.trim(),
                updatedAt: new Date().toISOString(),
            });
            const userInfo = await getUserData(userData?.uid);
            if (userInfo) {
                dispatch(setUserProfileData(userInfo));
                dispatch(setUserRole(userInfo.role?.toString() || ''));
            }
                ToastMessage.Custom('success', 'Profile Updated', 'Profile updated successfully');
                closeModel();
            } catch (error) {
                console.error('Update profile error:', error);
                ToastMessage.Custom('error', 'Failed to update profile', 'Please try again later');
            } finally {
                setLoading(false);
            }
        };

        return (
            <View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openModel()}
                    activeOpacity={0.8}
                >
                    <Icon name="edit" size={20} color="#000" />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <Modal
                    visible={showModel}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeModel}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Edit Profile</Text>
                                    <TouchableOpacity onPress={closeModel} style={styles.closeButton}>
                                        <Icon name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Name Input */}
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>
                                            Full Name <Text style={styles.required}>*</Text>
                                        </Text>
                                        <View style={[styles.inputContainer, nameError && styles.inputError]}>
                                            <Icon name="person" size={20} color="#FFD700" style={styles.icon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter your name"
                                                placeholderTextColor="#999"
                                                value={name}
                                                onChangeText={validateName}
                                                autoCapitalize="words"
                                            />
                                        </View>
                                        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                                    </View>

                                    {/* Email Input (Read-only) */}
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>Email Address</Text>
                                        <View style={[styles.inputContainer, styles.disabledInput]}>
                                            <Icon name="mail" size={20} color="#999" style={styles.icon} />
                                            <TextInput
                                                style={[styles.input, styles.disabledText]}
                                                value={email}
                                                editable={false}
                                            />
                                            <Icon name="lock" size={16} color="#999" />
                                        </View>
                                        <Text style={styles.helperText}>Email cannot be changed</Text>
                                    </View>

                                    {/* Mobile Input */}
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>
                                            Mobile Number <Text style={styles.required}>*</Text>
                                        </Text>
                                        <View style={[styles.inputContainer, mobileError && styles.inputError]}>
                                            <Icon name="phone" size={20} color="#FFD700" style={styles.icon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 10-digit mobile number"
                                                placeholderTextColor="#999"
                                                value={mobileNumber}
                                                onChangeText={validateMobile}
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                            />
                                        </View>
                                        {mobileError ? <Text style={styles.errorText}>{mobileError}</Text> : null}
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={closeModel}
                                            disabled={loading}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.saveButton, loading && styles.buttonDisabled]}
                                            onPress={handleSave}
                                            disabled={loading || !name || !mobileNumber}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#000" size="small" />
                                            ) : (
                                                <Text style={styles.saveButtonText}>Save</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        );
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 20,
            paddingHorizontal: 24,
            paddingBottom: 40,
            maxHeight: '85%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1A1A1A',
        },
        closeButton: {
            padding: 4,
        },
        inputWrapper: {
            marginBottom: 24,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
        },
        required: {
            color: '#FF5252',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9F9F9',
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 56,
            borderWidth: 2,
            borderColor: '#F0F0F0',
        },
        inputError: {
            borderColor: '#FF5252',
            backgroundColor: '#FFF5F5',
        },
        disabledInput: {
            backgroundColor: '#F5F5F5',
            borderColor: '#E8E8E8',
        },
        icon: {
            marginRight: 12,
        },
        input: {
            flex: 1,
            color: '#1A1A1A',
            fontSize: 16,
            fontWeight: '500',
        },
        disabledText: {
            color: '#999',
        },
        errorText: {
            color: '#FF5252',
            fontSize: 13,
            marginTop: 6,
            marginLeft: 4,
        },
        helperText: {
            color: '#999',
            fontSize: 12,
            marginTop: 6,
            marginLeft: 4,
            fontStyle: 'italic',
        },
        buttonContainer: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 12,
        },
        cancelButton: {
            flex: 1,
            height: 54,
            borderRadius: 12,
            backgroundColor: '#F5F5F5',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E8E8E8',
        },
        cancelButtonText: {
            color: '#666',
            fontSize: 16,
            fontWeight: '600',
        },
        saveButton: {
            flex: 1,
            height: 54,
            borderRadius: 12,
            backgroundColor: '#FFD700',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        buttonDisabled: {
            backgroundColor: '#E8E8E8',
            shadowOpacity: 0,
        },
        saveButtonText: {
            color: '#000',
            fontSize: 16,
            fontWeight: 'bold',
        },
        editButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFD700',
            height: 54,
            borderRadius: 14,
            gap: 10,
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        editButtonText: {
            color: '#000',
            fontSize: 16,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
    });


    export default EditProfileModal;