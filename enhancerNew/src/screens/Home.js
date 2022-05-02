import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 20,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 120,
  },
  touchable: {
    alignItems: 'center',
  },
});

export const Home = ({ navigation }) => {
  const [res, setRes] = useState(null);
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
      <TouchableOpacity onPress={() => selectFile()} style={styles.touchable}>
        <Image source={require('../assets/upload.png')} style={styles.image} />
        <Text style={{ color: '#F4717F' }}> Upload Image </Text>
      </TouchableOpacity>
    </View>
  );
};
