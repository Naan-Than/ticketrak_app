import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, ScrollView, Platform, Alert, PermissionsAndroid } from 'react-native';
import { pick } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ToastMessage } from '../../constants/TostMessages';

interface CustomDocumentPickerProps {
    onChange?: (files: any[]) => void;
    clear?: boolean;
}

const CustomDocumentPicker: React.FC<CustomDocumentPickerProps> = ({ onChange, clear }) => {
    const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

    useEffect(() => {
        if (clear) {
            setSelectedDocs([]);
            onChange?.([]);
        }
    }, [clear]);

    const getStoragePermissionType = () => {
        if (Platform.OS === 'ios') {
            return PERMISSIONS.IOS.PHOTO_LIBRARY;
        } else {
            const androidVersion = Platform.Version;
            return androidVersion >= 33
                ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        }
    };
    const requestStoragePermission = async (): Promise<boolean> => {
        const permission = getStoragePermissionType();

        try {
            if (Platform.OS === 'android') {
                const status = await PermissionsAndroid.check(permission as any);
                if (status) return true;

                const granted = await PermissionsAndroid.request(permission as any, {
                    title: 'Storage Permission',
                    message: 'This app needs access to your storage to upload files',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                // iOS
                const status = await check(permission);
                if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) return true;

                if (status === RESULTS.DENIED) {
                    const result = await request(permission);
                    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
                }

                if (status === RESULTS.BLOCKED) {
                    Alert.alert(
                        'Permission Required',
                        'Please grant storage permission in your device settings to select documents.',
                        [{ text: 'OK' }]
                    );
                    return false;
                }

                return false;
            }
        } catch (err) {
            console.error('Permission check failed:', err);
            return false;
        }
    }
    const handlePickDocuments = async () => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            ToastMessage.Custom('error', 'Storage permission denied. Aborting document pick.')
            console.log('Storage permission denied. Aborting document pick.');
            return;
        }

        try {
            const result = await pick({
                allowMultiSelection: true,
                type: [
                    'image/*', // for images
                    'application/pdf', // for pdfs
                    'application/msword', // for .doc
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // for .docx
                ],
            });

            if (result && result.length > 0) {
                const updated = [...selectedDocs, ...result];
                setSelectedDocs(updated);
                onChange?.(updated);
            }
        } catch (err) {
            console.warn('Document pick cancelled or failed:', err);
        }
    };

    const handleRemove = (uri: string) => {
        const updated = selectedDocs.filter(item => item.uri !== uri);
        setSelectedDocs(updated);
        onChange?.(updated);
    };

    const isImage = (file: any) => {
        const mime = file.type?.toLowerCase() || '';
        const name = file.name?.toLowerCase() || '';
        return (
            mime.startsWith('image/') ||
            name.endsWith('.png') ||
            name.endsWith('.jpg') ||
            name.endsWith('.jpeg')
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView horizontal={false} contentContainerStyle={styles.scrollContainer}>
                {selectedDocs.map((item, index) => (
                    <View key={index} style={styles.fileBox}>
                        <TouchableOpacity hitSlop={20} style={styles.removeIcon} onPress={() => handleRemove(item.uri)}>
                            <Ionicons name="close-circle" size={18} color="red" />
                        </TouchableOpacity>

                        {isImage(item) ? (
                            <Image source={{ uri: item.uri }} style={styles.imagePreview} resizeMode="cover" />
                        ) : (
                            <View style={styles.docIconBox}>
                                <Ionicons name="document-text" size={32} color="#555" />
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {item.name || 'File'}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}

                {/* Add button */}
                <TouchableOpacity style={styles.addBox} onPress={handlePickDocuments}>
                    <Icon name="attach-file" size={24} color="#555" />
                    <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default CustomDocumentPicker;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
    },
    addBox: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addText: {
        fontSize: 10,
        color: '#555',
        marginTop: 2,
    },
    fileBox: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    removeIcon: {
        position: 'absolute',
        top: 2,
        right: 2,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    docIconBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: 5,
    },
    fileName: {
        fontSize: 8,
        color: '#333',
        marginTop: 2,
        textAlign: 'center',
    },
});