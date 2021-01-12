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
  ImageBackground,
  PermissionsAndroid,
  Alert
} from 'react-native';
import normalize from 'react-native-normalize';
import { RFPercentage } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-community/async-storage';
import KeyboardManager from 'react-native-keyboard-manager';

import GetLocation from 'react-native-get-location';
import Geocoder from 'react-native-geocoding';
Geocoder.init('AIzaSyDdPAhHXaBBh2V5D2kQ3Vy7YYrDrT7UW3I');

import {
  request, requestMultiple,
  check, checkMultiple,
  PERMISSIONS, RESULTS
} from 'react-native-permissions';

import Spinner from 'react-native-loading-spinner-overlay';

import { Colors, Images, Constants } from '@constants';
import { getUser, getData, checkInternet } from '../service/firebase';

export default function Splash({ navigation }) {

  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') keyboardManager();

    if (Platform.OS == 'android') {
      requestPermissionAndroid()
        .then(() => {
          requestLocation();
          // getAllData();
        })
        .catch((err) => {
          console.log('request permission error', err)
        })
    }
    else {
      requestPermissionIOS()
        .then(() => {
          requestLocation();
          // getAllData();
        })
        .catch((err) => {
          console.log('request permission error', err);
        })
    }
  }, [])

  keyboardManager = () => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
      KeyboardManager.setEnableDebugging(false);
      KeyboardManager.setKeyboardDistanceFromTextField(10);
      KeyboardManager.setPreventShowingBottomBlankSpace(true);
      KeyboardManager.setEnableAutoToolbar(true);
      KeyboardManager.setToolbarDoneBarButtonItemText("Done");
      KeyboardManager.setToolbarManageBehaviour(0);
      KeyboardManager.setToolbarPreviousNextButtonEnable(false);
      KeyboardManager.setShouldToolbarUsesTextFieldTintColor(false);
      KeyboardManager.setShouldShowTextFieldPlaceholder(true); // deprecated, use setShouldShowToolbarPlaceholder
      KeyboardManager.setShouldShowToolbarPlaceholder(true);
      KeyboardManager.setOverrideKeyboardAppearance(false);
      KeyboardManager.setShouldResignOnTouchOutside(true);
      KeyboardManager.resignFirstResponder();
      KeyboardManager.isKeyboardShowing()
        .then((isShowing) => {
        });
    }
  }

  requestPermissionAndroid = async () => {
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ]);
      if (results[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('all permission granted');

      }
      else {
        console.log('permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  requestPermissionIOS = () => {
    return new Promise((resolve, reject) => {
      requestMultiple([PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.PHOTO_LIBRARY]).then(
        (statuses) => {
          // console.log('Camera', statuses[PERMISSIONS.IOS.CAMERA]);
          // console.log('Photo Library', statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]);          
          resolve();
        }
      ).catch((err) => {
        reject(err)
      })
    })
  }

  requestLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 150000,
    })
      .then(location => {
        Constants.location.latitude = location.latitude;
        Constants.location.longitude = location.longitude;
        // console.log('location', Constants.location);
        setSpinner(true);
        Geocoder.from({
          lat: location.latitude,
          lng: location.longitude
        })
          .then(json => {
            var addressComponents = json.results[0].address_components;
            for (var i = 0; i < addressComponents.length; i++) {
              if (addressComponents[i].types[0] == 'country') {
                Constants.country.name = addressComponents[i].long_name;
                Constants.country.code = addressComponents[i].short_name;
              }
            }
            getAllData();
          })
          .catch(err => {
            console.log('geocoder error', err);
            getAllData();
          });
      })
      .catch(ex => {
        // GetLocation.openAppSettings();
        getAllData(); //temp
      });
  }

  getAllData = async () => {
    setSpinner(true);
    await getData('users').then(res => Constants.users = res);
    await getData('foods').then(res => Constants.foods = res.sort((a, b) => a.dispOrder - b.dispOrder));
    await getData('landscapes').then(res => Constants.landscapes = res.sort((a, b) => a.dispOrder - b.dispOrder));
    await getData('childs').then(res => Constants.childs = res);

    goScreen();
  }

  goScreen = () => {
    AsyncStorage.getItem('userdemouser')
      .then((user) => {
        if (user) {
          setSpinner(false);
          Constants.user = JSON.parse(user);
          
          if (Constants.user.profileStep == 1) { Constants.processType = 'newProfile'; navigation.navigate('Register', { screen: 'Detail' });}
          else if (Constants.user.profileStep == 2) navigation.navigate('Register', { screen: 'Address' });
          else if (Constants.user.profileStep == 3) navigation.navigate('Register', { screen: 'Preferences' });
          else if (Constants.user.profileStep == 4) navigation.navigate('Register', { screen: 'Pictures' });
          else if (Constants.user.profileStep == 5) navigation.navigate('Main', {screen: 'Home'});
          // else if (Constants.user.profileStep == 5) navigation.navigate('Register', {screen: 'Detail'});
        }
        else {
          setSpinner(false);
          navigation.navigate('Register');
        }
      })
  }

  return (
    <View style={styles.container}>
      <Spinner
        visible={spinner}
        textContent={''}
      />
      <Text style={styles.title}>User Demo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'    
  },
  title: {
    fontSize: RFPercentage(3),
    color: Colors.blue,
  },

});