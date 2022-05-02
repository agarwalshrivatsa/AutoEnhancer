/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
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
  modalContainer: {
    alignSelf: 'center',
    width: 300,
    borderRadius: 20,
    height: 250,
    backgroundColor: '#D9C8C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalElement: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
});

export const Preview = ({ route, navigation }) => {
  const { file } = route.params;
  const [res, setRes] = useState(null);
  const [isLoading, setIsLoading] = useState(false)

  const features = {
    redEye: 'Red-Eye Removal',
    faceSmoothing: 'Facial Smoothing',
    illumination: 'Illumination Enhancement',
  };
  const [config, setConfig] = useState({
    redEye: false,
    faceSmoothing: false,
    illumination: false,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const sendImage = () => {
    let flag = false;
    setIsLoading(true);
    Object.keys(config).forEach(item => {
      if (config[item]) {
        flag = true;
      }
    })
    if (!flag) {
      Alert.alert("Atleast one feature must be selected for processing.")
    }
    else {

      const data = new FormData();

      data.append('redEye', config.redEye)
      data.append('faceSmoothing', config.faceSmoothing)
      data.append('illumination', config.illumination)

      if (res === null) {
        data.append('imageType', file.type)
        data.append('file', file.base64)
      }
      else {
        data.append('imageType', res.assets[0].type)
        data.append('file', res.assets[0].base64)
      }
      setRes(null)
      setModalOpen(false)
      fetch('http://127.0.0.1:5000', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        body: data,
      }).then((response) => response.json())
        .then(response => {
          setIsLoading(false)
          if (response.status === 'NoFaceDetected') {
            Alert.alert('NoFaceDetected')
          }
          else {
            navigation.push('Output', { output: response.output })
          }
        },
          err => {
            if (err instanceof TypeError) {
              Alert.alert("Could not connect to server.");
            }
            else {
              Alert.alert('This image cannot be processed.');
            }
            setIsLoading(false);
            console.log(err);
          }
        )
        .catch(function (error) {
          console.debug(
            `There has been a problem with your fetch operation: ${error.message}`,
          );
          // ADD THIS THROW error
          throw error;
        });
      // .then(response =>
      //   response.json().then(
      //     dataa => console.log(dataa),
      //     err => console.debug(err),
      //   ),
      // )
    }
  };
  useEffect(() => {
    console.log({ config })
  }, [config])

  const selectFile = () => {
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
        setRes(resp);
      }
    });
  };
  const a = item => (
    <View key={item} style={styles.modalElement}>
      <Text style={{ color: "#544E50", fontWeight: 'bold' }}>{features[item]}</Text>
      <Switch
        value={config[item]}
        onChange={() => {
          setConfig({
            ...config,
            [item]: !config[item],
          });
        }}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        style={styles.modal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={{ color: "black", fontWeight: 'bold', position: 'absolute', margin: 'auto', top: 25, fontSize: 20 }}>Settings</Text>
            {Object.keys(features).map(item => a(item))}
            <TouchableOpacity onPress={() => setModalOpen(false)} style={{ position: 'absolute', left: 25, bottom: 25 }}>
              <Text style={{ color: "black", fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                sendImage();
              }}
              style={{ position: 'absolute', right: 25, bottom: 25 }}
            >
              <Text style={{ color: "black", fontWeight: 'bold', fontSize: 16 }}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={isLoading} transparent>
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={{ color: "#544E50", fontWeight: 'bold' }}>
              Image sent for processing!
            </Text>
            <Text style={{ color: "#544E50", fontWeight: 'bold' }}>
              This may take a while.
            </Text>
          </View>
        </View>
      </Modal >
      <FastImage
        style={{ flex: 1 }}
        source={res === null ? { uri: file.uri.toString() } : { uri: res.assets[0].uri }}
        resizeMode="cover"
      />
      <TouchableOpacity style={styles.pickAnother} onPress={() => selectFile()}>
        <Image
          source={require('../assets/gallery.png')}
          style={styles.bottomBarIcons}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setModalOpen(true)}
      >
        <Image
          source={require('../assets/right-arrow.png')}
          style={styles.bottomBarIcons}
        />
      </TouchableOpacity>
    </View >
  );
};
