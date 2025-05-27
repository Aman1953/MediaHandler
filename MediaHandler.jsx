import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
    ToastAndroid,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { pick, types } from '@react-native-documents/picker';
import { viewDocument } from '@react-native-documents/viewer';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const getFileType = (uri, fileType) => {
    if (fileType) return fileType;
    const extension = uri?.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'video';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['docx'].includes(extension)) return 'docx';
    return 'unknown';
};

const MediaHandler = ({ mediaFiles, setMediaFiles, label = "Pick Media", isMultiple = true }) => {
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isVideoPaused, setIsVideoPaused] = useState(true);

    // Image/Video picker
    const handlePickMedia = async () => {
        launchImageLibrary(
            {
                mediaType: 'mixed',
                selectionLimit: isMultiple ? 0 : 1,
            },
            (response) => {
                if (response.didCancel) return;

                const selected = response.assets || [];
                const uniqueNewMedia = selected.filter(
                    (file) => !mediaFiles.some((existing) => existing.uri === file.uri)
                );
                const formatted = uniqueNewMedia.map((file) => ({ uri: file.uri }));

                if (formatted.length < selected.length) {
                    ToastAndroid.show("Duplicate media skipped", ToastAndroid.SHORT);
                }

                setMediaFiles((prev) => [...prev, ...formatted]);
            }
        );
    };

    // PDF/DOCX picker
    const handlePickDocuments = async () => {
        try {
            const res = await pick({
                allowMultiSelection: isMultiple,
                type: [
                    types.pdf,
                    types.docx,
                    types.xlsx,
                    'application/vnd.ms-excel',
                    'application/vnd.ms-powerpoint', // <-- for .ppt
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // <-- for .pptx
                ],
            });
            const allFilesArePdfOrDocx = res.every((file) => file.hasRequestedType);
            if (!allFilesArePdfOrDocx) {
                ToastAndroid.show("Only PDF and DOCX files are allowed", ToastAndroid.SHORT);
                return;
            }
            // Prevent duplicates and store fileType and mimeType
            const uniqueNewMedia = res.filter(
                (file) => !mediaFiles.some((existing) => existing.uri === file.uri)
            ).map((file) => {
                let fileType = 'unknown';
                if (
                    file.mimeType === 'application/pdf' ||
                    file.name?.toLowerCase().endsWith('.pdf')
                ) {
                    fileType = 'pdf';
                } else if (
                    file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.name?.toLowerCase().endsWith('.docx')
                ) {
                    fileType = 'docx';
                } else if (
                    file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.name?.toLowerCase().endsWith('.xlsx')
                ) {
                    fileType = 'xlsx';
                } else if (
                    file.mimeType === 'application/vnd.ms-excel' ||
                    file.name?.toLowerCase().endsWith('.xls')
                ) {
                    fileType = 'xls';
                } else if (
                    file.mimeType === 'application/vnd.ms-powerpoint' ||
                    file.name?.toLowerCase().endsWith('.ppt')
                ) {
                    fileType = 'ppt';
                } else if (
                    file.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                    file.name?.toLowerCase().endsWith('.pptx')
                ) {
                    fileType = 'pptx';
                }
                return {
                    uri: file.uri,
                    fileType,
                    mimeType: file.mimeType ||
                        (fileType === 'pdf'
                            ? 'application/pdf'
                            : fileType === 'docx'
                                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                : fileType === 'xlsx'
                                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    : fileType === 'xls'
                                        ? 'application/vnd.ms-excel'
                                        : fileType === 'ppt'
                                            ? 'application/vnd.ms-powerpoint'
                                            : fileType === 'pptx'
                                                ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                                : undefined),
                };
            });

            setMediaFiles((prev) => [...prev, ...uniqueNewMedia]);
        } catch (err) {
            ToastAndroid.show("Error picking document", ToastAndroid.SHORT);
        }
    };

    const openViewer = (index) => {
        setSelectedIndex(index);
        setIsVideoPaused(true);
        setViewerVisible(true);
    };

    const handleRemoveMedia = (uri) => {
        setMediaFiles((prev) => prev.filter((item) => item.uri !== uri));
    };

    return (
        <View style={{ marginBottom: 20 }}>
            <TouchableOpacity style={styles.pickMediaButton} onPress={handlePickMedia}>
                <Text style={styles.pickMediaButtonText}>{label}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.pickMediaButton, { backgroundColor: '#e74c3c' }]}
                onPress={handlePickDocuments}
            >
                <Text style={styles.pickMediaButtonText}>Pick PDF or DOCX</Text>
            </TouchableOpacity>

            <FlatList
                data={mediaFiles}
                horizontal
                keyExtractor={(item, index) => item.uri + index}
                renderItem={({ item, index }) => {
                    const fileType = getFileType(item.uri, item.fileType);
                    return (
                        <View style={{ position: 'relative', marginRight: 10 }}>
                            <TouchableOpacity
                                // onPress={async () => {
                                //     if (fileType === 'pdf') {
                                //         try {
                                //             await viewDocument({ uri: item.uri, mimeType: 'application/pdf' });
                                //         } catch {
                                //             ToastAndroid.show("Unable to open PDF", ToastAndroid.SHORT);
                                //         }
                                //     } else if (fileType === 'docx') {
                                //         try {
                                //             await viewDocument({ uri: item.uri, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                                //         } catch {
                                //             ToastAndroid.show("Unable to open DOCX", ToastAndroid.SHORT);
                                //         }
                                //     } else {
                                //         openViewer(index);
                                //     }
                                // }}
                                onPress={() => openViewer(index)}
                                style={styles.thumbnailBox}
                            >
                                {fileType === 'image' ? (
                                    <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                                ) : fileType === 'video' ? (
                                    <>
                                        <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                                        <View style={styles.playIconOverlay}>
                                            <Text style={styles.playIconText}>▶</Text>
                                        </View>
                                    </>
                                ) : fileType === 'pdf' ? (
                                    <View style={[styles.thumbnail, styles.pdfThumbnail]}>
                                        <Text style={styles.pdfIconText}>PDF</Text>
                                    </View>
                                ) : fileType === 'docx' ? (
                                    <View style={[styles.thumbnail, styles.docxThumbnail]}>
                                        <Text style={styles.docxIconText}>DOCX</Text>
                                    </View>
                                ) : fileType === 'xlsx' ? (
                                    <View style={[styles.thumbnail, { backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>XLSX</Text>
                                    </View>
                                ) : fileType === 'xls' ? (
                                    <View style={[styles.thumbnail, { backgroundColor: '#16a085', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>XLS</Text>
    </View>
) : fileType === 'ppt' ? (
    <View style={[styles.thumbnail, { backgroundColor: '#d35400', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>PPT</Text>
    </View>
) : fileType === 'pptx' ? (
    <View style={[styles.thumbnail, { backgroundColor: '#e67e22', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>PPTX</Text>
    </View>
) : null}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveMedia(item.uri)}
                            >
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                contentContainerStyle={styles.thumbnailList}
                showsHorizontalScrollIndicator={false}
            />

            <Modal visible={viewerVisible} onRequestClose={() => setViewerVisible(false)} animationType="slide">
                <FlatList
                    data={mediaFiles}
                    horizontal
                    pagingEnabled
                    initialScrollIndex={selectedIndex}
                    getItemLayout={(data, index) => ({
                        length: screenWidth,
                        offset: screenWidth * index,
                        index,
                    })}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.floor(e.nativeEvent.contentOffset.x / screenWidth);
                        setSelectedIndex(index);
                        setIsVideoPaused(true); // Pause all on swipe
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        const fileType = getFileType(item.uri, item.fileType);
                        return (
                            <View style={styles.fullscreenContainer}>
                                {fileType === 'image' ? (
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.fullscreenImage}
                                        resizeMode="contain"
                                    />
                                ) : fileType === 'video' ? (
                                    <TouchableOpacity onPress={() => setIsVideoPaused(!isVideoPaused)}>
                                        <Video
                                            source={{ uri: item.uri }}
                                            style={styles.fullScreenVideo}
                                            paused={isVideoPaused}
                                            controls
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                ) : (fileType === 'pdf' || fileType === 'docx' || fileType === 'xlsx' || fileType === 'xls' || fileType === 'ppt' || fileType === 'pptx') ? (
                                    <TouchableOpacity
                                        style={styles.openDocButton}
                                        onPress={async () => {
                                            try {
                                                await viewDocument({
                                                    uri: item.uri,
                                                    mimeType: item.mimeType ||
                                                        (fileType === 'pdf'
                                                            ? 'application/pdf'
                                                            : fileType === 'docx'
                                                                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                                                : fileType === 'xlsx'
                                                                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                                                    : fileType === 'xls'
                                                                        ? 'application/vnd.ms-excel'
                                                                        : fileType === 'ppt'
                                                                            ? 'application/vnd.ms-powerpoint'
                                                                            : fileType === 'pptx'
                                                                                ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                                                                : undefined)
                                                });
                                            } catch {
                                                ToastAndroid.show("Unable to open document", ToastAndroid.SHORT);
                                            }
                                        }}
                                    >
                                        <Text style={styles.openDocButtonText}>
                                            Open this document
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        );
                    }}
                />

                <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.closeIcon}>
                    <Text style={styles.closeIconText}>×</Text>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    pickMediaButton: {
        backgroundColor: '#1e90ff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
    },
    pickMediaButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    thumbnailBox: {
        width: 80,
        height: 80,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailList: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    playIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playIconText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    pdfThumbnail: {
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdfIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    docxThumbnail: {
        backgroundColor: '#2980b9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    docxIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    fullscreenContainer: {
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    fullscreenImage: {
        width: screenWidth,
        height: screenHeight,
    },
    fullScreenVideo: {
        width: screenWidth,
        height: screenHeight * 0.5,
        backgroundColor: 'black',
    },
    closeIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 25,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIconText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    openDocButton: {
        backgroundColor: '#34495e',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    openDocButtonText: {
        color: '#ecf0f1',
        fontSize: 16,
        fontWeight: '500',
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 22,
    },
});

export default MediaHandler;