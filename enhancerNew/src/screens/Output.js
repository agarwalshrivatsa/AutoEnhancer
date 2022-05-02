/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Alert,
    PermissionsAndroid,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import RNFetchBlob from 'rn-fetch-blob';
import { launchImageLibrary } from 'react-native-image-picker';


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
    },
    nextButton: {
        backgroundColor: '#F4717F',
        borderRadius: 30,
        position: 'absolute',
        right: 15,
        bottom: 15,
    },
    pickAnother: {
        position: 'absolute',
        left: 15,
        bottom: 15,
        backgroundColor: '#F4717F',
        borderRadius: 30,
    },
    bottomBarIcons: {
        margin: 15,
        height: 30,
        width: 30,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});




export const Output = ({ route, navigation }) => {
    const { output } = route.params;

    useEffect(() => { checkPermission() }, [])

    const [storagePermission, setStoragePermission] = useState(false)

    const checkPermission = () => {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
            .then((isPermitted) => {
                if (isPermitted) {
                    setStoragePermission(true);
                }
                else {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                        message: 'Please Grant Access to Storage.',
                        title: 'Storage permission',
                    }).then((res) => {
                        setStoragePermission(true);
                    })
                }
            })
    }

    const saveImage = (file) => {
        if (storagePermission) {
            const dirs = RNFetchBlob.fs.dirs
            const folderName = `${dirs.SDCardDir}/AutoEnhancer`;
            const fileName = `${folderName}/${(new Date()).getTime()}`;

            RNFetchBlob.fs.isDir(folderName).then((isDir) => {
                if (isDir) {
                    addImage(file, fileName);
                }
                else {
                    RNFetchBlob.fs.mkdir(folderName).then(() => {
                        addImage(file, fileName);
                    }, err => console.debug(err))
                }
            }, err => console.debug(err))
                .catch(err => console.debug(err))
        }
        else {
            Alert.alert("Storage Permission denied.")
        }

    }

    const addImage = (file, fileName) => {
        RNFetchBlob.fs.createFile(fileName, file, 'base64').then(() => {
            RNFetchBlob.fs.scanFile({ path: fileName }).then(() => {
                Alert.alert('Image Saved!')
            })
        })
    }

    const [res, setRes] = useState(null);
    const selectFile = () => {
        console.log('Hi from output')
        const options = {
            title: 'Select Image',
            includeBase64: true,
            storageOptions: {
                skipBackup: true,

                path: 'images',
            },
        };

        launchImageLibrary(options, resp => {
            if (resp.didCancel) {
                console.log('User cancelled image picker');
            } else if (resp.error) {
                console.log('ImagePicker Error: ', resp.error);
            } else {
                setRes(resp.assets[0]);
            }
        });
    };

    useEffect(() => {
        if (res != null) {
            navigation.push('Preview', { file: res });
        }
    }, [res]);

    return (
        <View style={styles.container}>
            <FastImage
                style={{ flex: 1 }}
                source={{ uri: `data:image/jpeg;base64,${output.toString()}` }}
                resizeMode="cover"
            />
            <TouchableOpacity style={styles.pickAnother} onPress={selectFile}>
                <Image
                    source={require('../assets/gallery.png')}
                    style={styles.bottomBarIcons}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.nextButton}
                onPress={() => { saveImage(output) }}
            >
                <Image
                    source={require('../assets/save.png')}
                    style={styles.bottomBarIcons}
                />
            </TouchableOpacity>
        </View>
    );
};
