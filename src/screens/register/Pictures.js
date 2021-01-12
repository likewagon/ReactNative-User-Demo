import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
  TextInput,
  ImageBackground,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import normalize from 'react-native-normalize';
import { RFPercentage } from 'react-native-responsive-fontsize';

import EntypoIcon from 'react-native-vector-icons/Entypo';
EntypoIcon.loadFont();
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, setData, checkInternet, uploadMedia } from '../../service/firebase';

export default function Pictures({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  const [pictures, setPictures] = useState([]);
  const [newPictures, setNewPictures] = useState([]);

  useEffect(() => {
    var aPictures = [];
    Constants.user.pictures.forEach(each=>{
      var item = {
        id: each.id,
        uri: each.uri,
        type: 'old'
      };
      aPictures.push(item);
    })
    setPictures(aPictures);
  }, [])

  function onPicture(item) {
    var options = {
      mediaType: 'photo',
      maxWidth: normalize(90),
      maxHeight: normalize(90)
    }

    launchImageLibrary(options, response => {
      if (response.didCancel) {
      } else if (response.errorMessage) {
        Alert.alert('Loading Photo Failed.');
      } else {
        if (item) {
          var pictureItem = pictures.find(each => each.id == item.id);
          pictureItem.uri = response.uri;
          pictureItem.type = 'new';
          
          var aPictures = [...pictures];
          var index = aPictures.findIndex(each => each.id == item.id);          
          aPictures.splice(index, 1, pictureItem);
          
          setPictures(aPictures);
        }
        else {          
          var newPicture = {
            id: Constants.user?.id + '_' + pictures.length,
            uri: response.uri,
            type: 'new'
          };

          var aPictures = [...pictures];
          aPictures.push(newPicture); 
          setPictures(aPictures);
        }
      }
    })
  }

  uploadPictures = () => {
    var filters = pictures.filter(each=>each.type === 'new');
    var promises = filters.map(each=>{return new Promise(async (resolve, reject)=>{
      var platformPhotoLocalPath = Platform.OS === "android" ? each.uri : each.uri.replace("file://", "")
        await uploadMedia('pictures', each.id, platformPhotoLocalPath)
        .then((downloadURL) => {
          if (!downloadURL) return;
          // console.log('downloadURL', downloadURL)
          each.uri = downloadURL;
          resolve();
        })
        .catch((err) => {
          console.log('upload picture error', err);
          reject(err);
        })
    })})

    return new Promise((resolve, reject) => {
      Promise.all(promises).then((values)=>{
        console.log('upload pictures res', values)
        resolve();
      })
      .catch(err=>{
        reject();
      })
    })
  }

  async function onDone() {
    var filters = pictures.filter(each=>each.type === 'new');
    if (filters.length > 0) {
      setSpinner(true);
      await uploadPictures()
        .then(() => {
          updateUser();
        })
        .catch((err) => {
          console.log('upload pictures error', err);
          Alert.alert(
            'Upload pictures failed.',
            '',
            [
              { text: "OK", onPress: () => setSpinner(false) }
            ],
          );
        })
    }
    else {
      updateUser();
    }    
  }

  function updateUser() {
    
    var uPictures = [];
    pictures.forEach(each=>{
      var item = {
        id: each.id,
        uri: each.uri
      };
      uPictures.push(item);
    })

    Constants.user.pictures = uPictures;
    Constants.user.profileStep = 5;

    setData('users', 'update', Constants.user)
      .then(() => {
        setSpinner(false);
        AsyncStorage.setItem('userdemouser', JSON.stringify(Constants.user));
        navigation.navigate('Main', {screen: 'Home'});
      })
      .catch(err => {
        console.log('update user error', err);
        Alert.alert(
          'Update user failed.',
          '',
          [
            { text: "OK", onPress: () => setSpinner(false) }
          ],
        );
      })
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image style={styles.imgBack} source={Images.authBack} />
      <Spinner
        visible={spinner}
        textContent={''}
      />
      <View style={styles.header}>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => { navigation.navigate('Preferences') }}>
            <Text style={styles.sideTxt}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Favorite Pictures</Text>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => onDone()}>
            <Text style={styles.sideTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ alignItems: 'center' }}>
        {
          pictures.map((each, index) => (
            <View key={index} style={styles.pictureImgBox}>
              <TouchableOpacity style={styles.pictureBtn} onPress={() => onPicture(each)}>
                {
                  each.uri &&
                  <Image style={styles.pictureImg} source={{ uri: each.uri }} resizeMode='cover' />
                }
              </TouchableOpacity>
            </View>
          ))
        }

        <View style={styles.pictureImgBox}>
          <TouchableOpacity style={styles.pictureBtn} onPress={() => onPicture()}>
            <EntypoIcon name="plus" style={styles.pictureTxt}></EntypoIcon>
            <Text style={styles.pictureTxt}>picture</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  header: {
    width: '100%',
    height: normalize(70, 'height'),
    flexDirection: 'row',
    backgroundColor: Colors.blackColor
  },
  sideContainer: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerIcon: {
    fontSize: RFPercentage(3.5),
    color: Colors.whiteColor,
  },
  titleContainer: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleTxt: {
    fontSize: RFPercentage(3),
    fontWeight: '600',
    color: Colors.black,
  },
  sideTxt: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    color: Colors.black,
  },

  body: {
    flex: 1,
  },

  pictureImgBox: {
    width: normalize(120),
    height: normalize(120),
    borderWidth: normalize(3),
    borderColor: Colors.grey,
    marginTop: normalize(10, 'height')
  },
  pictureImg: {
    width: '100%',
    height: '100%'
  },
  pictureBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pictureTxt: {
    fontSize: RFPercentage(2.5),
    color: Colors.blackColor,
  },
});