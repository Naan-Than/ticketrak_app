import React, { useState } from 'react';
import { TouchableOpacity, Image, View, Text, Modal, StyleSheet, Pressable, Linking, Alert, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ToastMessage } from '../../constants/TostMessages';
const { height, width } = Dimensions.get('window')

const FileAttachment = ({ file }: { file: any }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const isImage = (file: any) => {
        return file.type?.startsWith('image') || /\.(jpg|jpeg|png|gif)$/i.test(file.name);
    };

    const isPDF = (file: any) => {
        return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    };

    const handlePress = () => {
        if (isImage(file)) {
            setModalVisible(true);
        } else if (isPDF(file)) {
            Linking.openURL(file.url).catch(() => {
                ToastMessage.Custom('error', 'Cannot open PDF')
            });
        } else {
            Alert.alert(file.name);
            ToastMessage.Custom('info', file.name)
        }
    };

    return (
        <>
            <TouchableOpacity key={file.id} style={styles.attachmentBox} onPress={handlePress}>
                {isImage(file) ? (
                    <Image source={{ uri: file.url }} style={styles.attachmentImage} resizeMode="cover" />
                ) : (
                    <View style={styles.docIconBox}>
                        <Ionicons name="document-text" size={32} color="#555" />
                        <Text style={styles.fileName} numberOfLines={1}>
                            {file.name || 'File'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {isImage(file) && (
                <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalBackground}>
                        <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
                            <Image source={{ uri: file.url }} style={styles.fullscreenImage} resizeMode="contain" />
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Ionicons name="close-circle" size={36} color="white" />
                        </Pressable>
                    </View>
                </Modal>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    attachmentBox: {
        width: 100,
        height: 100,
        margin: 8,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentImage: {
        width: '100%',
        height: '100%',
    },
    docIconBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: {
        marginTop: 4,
        fontSize: 12,
        color: '#555',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 1.5,
        width: width
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 10,
        zIndex: 10,
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
    },
});

export default FileAttachment;
