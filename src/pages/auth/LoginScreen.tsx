import React, { use, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { setIsloggedIn, setUserProfileData, setUserRole } from '../../store/slice/authSlice';
import { getUserData, signInService } from '../../services/auth.service';
import { ToastMessage } from '../../constants/TostMessages';

const { width } = Dimensions.get('window');

export default function LoginScreen(props: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsloading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const dispatch = useDispatch();

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const validateEmail = (text: string) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (text && !emailRegex.test(text)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
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

    const handleLogin = async () => {
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (emailError || passwordError) {
            return;
        }
        console.log('Login successful');
        try {
            setIsloading(true);
            const response = await signInService(email, password);
            console.log('Login response:', response);
            if (response && response.uid) {
                try {
                    const userData = await getUserData(response.uid);
                    if (userData) {
                        dispatch(setUserProfileData(userData));
                        dispatch(setUserRole(userData.role?.toString() || ''));
                        dispatch(setIsloggedIn(true));
                        console.log('UID:', response.uid);
                        ToastMessage.Custom('success', 'Login Successful', 'You have successfully logged in');
                        console.log('Email:userDatauserData', userData);
                    }
                } catch (e) {
                    console.log(e);
                    ToastMessage.Custom('error', 'Login Failed', 'An error occurred during login');
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            ToastMessage.Custom('error', 'Login Failed', 'An error occurred during login');
        } finally {
            setIsloading(false);
        }



    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="shield-checkmark" size={50} color="#FFD700" />
                    </View>
                    <Text style={styles.brandText}>Login</Text>
                    <Text style={styles.tagline}>Welcome back! Please log in to continue.</Text>
                </View>

                <View style={styles.formContainer}>
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


                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                        ]}
                        onPress={handleLogin}
                        disabled={!email || !password || !!emailError || !!passwordError}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#000" size={'small'}/>
                        ) : (  <> 
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Icon name="arrow-forward" size={20} color="#000" style={styles.arrowIcon} /></>)}
                    </TouchableOpacity>

                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#0A0A0A',
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
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
        marginTop: 4,
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
        // backgroundColor: '#1A1A1A',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        color: '#000',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        // color: '#FFF',
        color: '#000',
        fontSize: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#FFD700',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    loginButtonDisabled: {
        backgroundColor: '#3A3A3A',
    },
    loginButtonText: {
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
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        color: '#888',
        fontSize: 14,
    },
    signupLink: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
    },
});