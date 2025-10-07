import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { ToastMessage } from '../../constants/TostMessages';

const ChangePasswordModal: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModel, setShowModel] = useState(false);

    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [currentPasswordError, setCurrentPasswordError] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const reauthenticate = async (password: string) => {
        const user = auth().currentUser;
        if (user && user.email) {
            const credential = auth.EmailAuthProvider.credential(user.email, password);
            await user.reauthenticateWithCredential(credential);
        }
    };

    const validatePasswords = (): boolean => {
        let isValid = true;

        if (!currentPassword) {
            setCurrentPasswordError('Current password is required');
            isValid = false;
        } else {
            setCurrentPasswordError('');
        }

        if (!newPassword || newPassword.length < 6) {
            setNewPasswordError('New password must be at least 6 characters');
            isValid = false;
        } else {
            setNewPasswordError('');
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    };

    const handleChangePassword = async () => {
        if (!validatePasswords()) return;

        try {
            setLoading(true);
            await reauthenticate(currentPassword);
            await auth().currentUser?.updatePassword(newPassword);
            ToastMessage.Custom('success', 'Password Changed', 'Password changed successfully');
            closeModel();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Change password error:', error);
            ToastMessage.Custom('error', 'Failed to change password', error?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    function openModel() {
        setShowModel(true)

    }
    function closeModel() {
        setShowModel(false);
    }

    return (
        <View>
            <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={() => openModel()}
                activeOpacity={0.8}
            >
                <Icon name="lock" size={20} color="#666" />
                <Text style={styles.changePasswordText}>Change Password</Text>
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
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Change Password</Text>
                                <TouchableOpacity onPress={closeModel}>
                                    <Icon name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Current Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        secureTextEntry={!showCurrentPassword}
                                        style={styles.input}
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        <Icon
                                            name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>New Password</Text>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        secureTextEntry={!showNewPassword}
                                        style={styles.input}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                        <Icon
                                            name={showNewPassword ? 'visibility' : 'visibility-off'}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        secureTextEntry={!showConfirmPassword}
                                        style={styles.input}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Icon
                                            name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Change Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 50,
    },

    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingLeft: 0,
        height: 48,
        width: "93%",
        fontSize: 16,
        color: '#000'
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#FFD700',
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    changePasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        height: 54,
        borderRadius: 14,
        gap: 10,
        borderWidth: 2,
        borderColor:  '#FFD700',
    },
    changePasswordText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePasswordModal;
