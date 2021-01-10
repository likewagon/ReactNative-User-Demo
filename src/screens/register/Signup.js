import React, { useState, useEffect, useRef } from 'react';

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
import PhoneInput from 'react-native-phone-number-input';

import { Colors, Images, Constants } from '@constants';
import { signinWithPhoneNumber, createUser, setData, checkInternet } from '../../service/firebase';

export default function Signup({ navigation }) {
  const [spinner, setSpinner] = useState(false);
  const [phone, setPhone] = useState();

  const [confirm, setConfirm] = useState();
  const [verifyCode, setVerifyCode] = useState();

  const [countryCode, setCountryCode] = useState(Constants.country.code);
  const [formattedPhone, setFormattedPhone] = useState();
  const phoneInput = useRef(null);
  
  async function onSend() {
    if (!phone) {
      Alert.alert('Please enter phone number');
      return;
    }
    // console.log('phone', phone)
    // console.log('formatphone', formattedPhone)

    var isConnected = await checkInternet();
    if (!isConnected) {
      Alert.alert('Please check your internet connection.');
      return;
    }

    setSpinner(true);

    await signinWithPhoneNumber(formattedPhone ?? phone)
      .then((confirmation) => {
        setConfirm(confirmation);
        Alert.alert(
          'Sent Successfully',
          'Please enter verify code sent by SMS',
          [
            { text: "OK", onPress: () => setSpinner(false) }
          ],
        );
      })
      .catch((err) => {
        console.log('phone signup error', err);
        Alert.alert(
          err.code,
          '',
          [
            { text: "OK", onPress: () => setSpinner(false) }
          ],
        );
      })
  }

  async function onVerify() {
    if (!confirm) {
      return;
    }
    if (!verifyCode) {
      Alert.alert('Please enter verify code');
      return;
    }

    var isConnected = await checkInternet();
    if (!isConnected) {
      Alert.alert('Please check your internet connection.');
      return;
    }

    try {
      setSpinner(true);
      await confirm.confirm(verifyCode)
        .then((res) => {
          if (res) {
            goNext(res.user?.uid);
          }
        })
    } catch (err) {
      console.log('Invalid code.');
      Alert.alert(
        'Invalid code',
        '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
      );
      return;
    }
  }

  async function goNext(uid) {
    var user = {
      id: uid,
      name: '',
      phone: phone,
      age: '',
      gender: '',
      height: '',
      weight: '',
      photo: '',
      address: {
        home: '',
        work: '',
        other: ''
      },
      location: {
        latitude: '',
        longitude: ''
      },
      foods: [],
      landscapes: [],
      preference: '',
      medication: '',
      allergy: '',
      otherinfo: '',
      pictures: [],
      pid: '',
      profileStep: 1,
    }

    await createUser(user)
      .then(() => {
        console.log('create user success');
        Alert.alert(
          'Account created!',
          '',
          [
            {
              text: "OK", onPress: () => {
                setSpinner(false);
                AsyncStorage.setItem('userdemouser', JSON.stringify(user));
                Constants.user = user;
                navigation.navigate('Detail');
              }
            }
          ],
        )
      })
      .catch((err) => {
        console.log('create user error', err);
        setSpinner(false)
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
          {/* <TouchableOpacity onPress={() => {}}>
            <EntypoIcon name="user" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity> */}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Sign up</Text>
        </View>
        <View style={styles.sideContainer}>
          {/* <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
            <EntypoIcon name="cog" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.phoneTipTxt}>Please enter your phone number and we will send you a code for verification</Text>
        {
          countryCode ?
            <PhoneInput
              ref={phoneInput}
              defaultValue={phone}
              defaultCode={countryCode}
              layout="first"
              onChangeText={(text) => setPhone(text)}
              onChangeFormattedText={(text) => setFormattedPhone(text)}
              containerStyle={{ width: '80%', height: normalize(45, 'height'), borderColor: Colors.grey, borderWidth: normalize(3), marginTop: normalize(40, 'height') }}
              textInputStyle={{height: normalize(30, 'height'), padding: 0, fontSize: RFPercentage(2.5) }}
              textInputProps={{keyboardType: 'numeric'}}
            />
            :
            <TextInput
              style={styles.inputBox}
              placeholder={'Please enter your phone number'}
              placeholderTextColor={Colors.grey}
              value={phone}
              keyboardType={'numeric'}
              onChangeText={(text) => setPhone(text)}
              // editable={false}
            />
        }

        <TouchableOpacity style={styles.btn} onPress={() => onSend()}>
          <Text style={styles.btnTxt}>Send Code</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter the code sent by SMS'}
          placeholderTextColor={Colors.grey}
          value={verifyCode}
          keyboardType={'numeric'}
          onChangeText={(text) => setVerifyCode(text)}
        >
        </TextInput>

        <TouchableOpacity style={styles.btn} onPress={() => onVerify()}>
          <Text style={styles.btnTxt}>Verify</Text>
        </TouchableOpacity>

      </View>
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

  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneTipTxt: {
    width: '80%',
    fontSize: RFPercentage(3.5),
    color: Colors.black,
    textAlign: 'center'
  },
  inputBox: {
    width: '80%',
    height: normalize(45, 'height'),
    fontSize: RFPercentage(2.5),
    borderColor: Colors.grey,
    borderWidth: normalize(3),
    marginTop: normalize(40, 'height'),
    paddingLeft: normalize(10),
  },

  btn: {
    width: '40%',
    height: normalize(45, 'height'),
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(30, 'height')
  },
  btnTxt: {
    fontSize: RFPercentage(2.2),
    color: Colors.black
  },

});