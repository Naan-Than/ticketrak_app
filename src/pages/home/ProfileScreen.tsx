import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { firestore } from '../../services/firebase';
import { signOutService } from '../../services/auth.service';
import { setResetUser } from '../../store/slice/authSlice';
import CustomAppBar from '../../components/common/CustomAppBar';
import { ToastMessage } from '../../constants/TostMessages';
import EditProfileModal from '../../components/profile/EditProfileModal';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';

interface UserProfile {
    name: string;
    email: string;
    mobileNumber: string;
    role: string;
}

const ProfileScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);

    useEffect(() => {
        fetchUserProfile();
    }, [userData]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const userId = userData?.uid;
            if (!userId) {
                ToastMessage.Custom('error', 'User not found', 'Please login again');
                return;
            }
            const userDoc = await firestore().collection('users').doc(userId).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                setProfile({
                    name: data?.name || 'N/A',
                    email: data?.email || 'N/A',
                    mobileNumber: data?.mobileNumber || 'N/A',
                    role: data?.role || 'User',
                });
            } else {
                ToastMessage.Custom('error', 'Profile not found', 'Please try again later');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            ToastMessage.Custom('error', 'Failed to load profile', 'Please try again later');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await signOutService();
        dispatch(setResetUser());
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return '#FF5722';
            case 'manager':
                return '#FF9800';
            case 'user':
                return '#4CAF50';
            default:
                return '#666';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'shield';
            case 'manager':
                return 'supervisor-account';
            case 'user':
                return 'person';
            default:
                return 'person';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <CustomAppBar title='Profile' />
                <View style={{ flex: 0.4 }} />
                <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 100 }} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomAppBar title='Profile' showBack={false} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.headerSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile?.name.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(profile?.role || 'user') }]}>
                            <Icon name={getRoleIcon(profile?.role || 'user')} size={16} color="#FFF" />
                            <Text style={styles.roleBadgeText}>{profile?.role.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{profile?.name}</Text>
                    <Text style={styles.userRole}>{profile?.role} Account</Text>
                </View>

                {/* Profile Info Cards */}
                <View style={styles.cardsContainer}>
                    {/* Email Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardIconContainer}>
                            <Icon name="mail" size={24} color="#FFD700" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardLabel}>Email Address</Text>
                            <Text style={styles.cardValue}>{profile?.email}</Text>
                        </View>
                    </View>

                    {/* Mobile Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardIconContainer}>
                            <Icon name="phone" size={24} color="#FFD700" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardLabel}>Mobile Number</Text>
                            <Text style={styles.cardValue}>{profile?.mobileNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.cardIconContainer}>
                            <Icon name={getRoleIcon(profile?.role || 'user')} size={24} color="#FFD700" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardLabel}>User Role</Text>
                            <View style={styles.roleContainer}>
                                <Text style={styles.cardValue}>{profile?.role}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <EditProfileModal />
                    <ChangePasswordModal />
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={loggingOut}
                    activeOpacity={0.8}
                >
                    {loggingOut ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="log-out-outline" size={24} color="#666" />
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 20,
    },
    content: {
        flex: 1,
    },
    headerSection: {
        backgroundColor: '#FFD700',
        paddingTop: 40,
        paddingBottom: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    roleBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFF',
        gap: 4,
    },
    roleBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    userRole: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    cardsContainer: {
        paddingHorizontal: 20,
        marginTop: -30,
        gap: 16,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    cardIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#FFFBF0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    cardValue: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
  
   
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
       backgroundColor: '#FFF',
        height: 54,
        borderRadius: 14,
        marginHorizontal: 20,
        marginTop: 24,
        gap: 10,
        shadowColor: '#FF5252',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 15,
        borderColor: '#E8E8E8',
    },
    logoutButtonText: {
         color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 30,
        gap: 4,
    },
    appVersion: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    appCopyright: {
        fontSize: 12,
        color: '#AAA',
    },
});

export default ProfileScreen;