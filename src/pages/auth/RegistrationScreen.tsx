import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signUpService } from '../../services/auth.service';
import { firestore } from '../../services/firebase';
import { ToastMessage } from '../../constants/TostMessages';
import CustomAppBar from '../../components/common/CustomAppBar';

const RegistrationScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const validateName = (text: string) => {
        setName(text);
        if (text && text.trim().length < 2) {
            setNameError('Name must be at least 2 characters');
        } else {
            setNameError('');
        }
    };

    const validateEmail = (text: string) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (text && !emailRegex.test(text)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
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

    const validatePassword = (text: string) => {
        setPassword(text);
        if (text && text.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    const validateConfirmPassword = (text: string) => {
        setConfirmPassword(text);
        if (text && text !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleRegister = async () => {
        if (!name) {
            setNameError('Name is required');
            return;
        }
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!mobileNumber) {
            setMobileError('Mobile number is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            return;
        }
        if (nameError || emailError || mobileError || passwordError || confirmPasswordError) {
            return;
        }

        try {
            setLoading(true);
            const user = await signUpService(email, password);

            await user.updateProfile({
                displayName: name,
            });

            await firestore().collection('users').doc(user.uid).set({
                name,
                email,
                mobileNumber,
                role: 'Agent',
                createdAt: new Date().toISOString(),
            });
            ToastMessage.Custom('success', 'Registration Successful', 'You have registered successfully!');
            setName(''); setEmail('');
            setMobileNumber(''); setPassword('');
            setConfirmPassword(''); setNameError('');
            setEmailError(''); setMobileError('');
            setPasswordError(''); setConfirmPasswordError('');

        } catch (error: any) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            }
            // Alert.alert('Error', errorMessage);
            ToastMessage.Custom('error', 'Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <CustomAppBar title='Create Agent' showBack={false} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="person-add" size={50} color="#FFD700" />
                        </View>
                        <Text style={styles.brandText}>Add Agent</Text>
                        <Text style={styles.tagline}>Add a new support agent</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <Icon name="person-outline" size={20} color="#B8B8B8" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#666"
                                    value={name}
                                    onChangeText={validateName}
                                    autoCapitalize="words"
                                />
                            </View>
                            {nameError ? (
                                <Text style={styles.errorText}>{nameError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <Icon name="mail-outline" size={20} color="#B8B8B8" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#666"
                                    value={email}
                                    onChangeText={validateEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {emailError ? (
                                <Text style={styles.errorText}>{emailError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <Icon name="phone" size={20} color="#B8B8B8" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mobile Number"
                                    placeholderTextColor="#666"
                                    value={mobileNumber}
                                    onChangeText={validateMobile}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                            {mobileError ? (
                                <Text style={styles.errorText}>{mobileError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <Icon name="lock-outline" size={20} color="#B8B8B8" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#666"
                                    value={password}
                                    onChangeText={validatePassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#B8B8B8"
                                    />
                                </TouchableOpacity>
                            </View>
                            {passwordError ? (
                                <Text style={styles.errorText}>{passwordError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <Icon name="lock" size={20} color="#B8B8B8" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#666"
                                    value={confirmPassword}
                                    onChangeText={validateConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#B8B8B8"
                                    />
                                </TouchableOpacity>
                            </View>
                            {confirmPasswordError ? (
                                <Text style={styles.errorText}>{confirmPasswordError}</Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton]}
                            onPress={handleRegister}
                            disabled={loading || !name || !email || !mobileNumber || !password || !confirmPassword || !!nameError || !!emailError || !!mobileError || !!passwordError || !!confirmPasswordError}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Text style={styles.registerButtonText}>Create Agent</Text>
                                </>
                            )}
                        </TouchableOpacity>


                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
        paddingTop: 20
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4B4000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
        marginBottom: 20,
    },
    brandText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 4,
        marginBottom: 5,
    },
    tagline: {
        fontSize: 12,
        color: '#888',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    formContainer: {
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#000',
        fontSize: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    registerButton: {
        backgroundColor: '#FFD700',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 30,
    },
    registerButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    arrowIcon: {
        marginLeft: 10,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2A2A2A',
    },
    dividerText: {
        color: '#666',
        paddingHorizontal: 15,
        fontSize: 12,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: '#888',
        fontSize: 14,
    },
    loginLink: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default RegistrationScreen;