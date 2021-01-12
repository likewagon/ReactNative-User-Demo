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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';

import { Colors, Images, Constants, getCountries } from '@constants';
import { signup, createUser, setData, checkInternet } from '../../service/firebase';

export default function Address({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  const [addressKind, setAddressKind] = useState('home');
  const [addressValues, setAddressValues] = useState({});

  const [countries, setCountries] = useState(getCountries());
  const [countryDropShow, setCountryDropShow] = useState(false);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const initialUser = Constants.processType === 'user' ? Constants.user : Constants.child;
    var tAddressValues = {
      address1: initialUser.address[addressKind]?.address1,
      address2: initialUser.address[addressKind]?.address2,
      city: initialUser.address[addressKind]?.city,
      country: initialUser.address[addressKind]?.country,
    }
    setAddressValues(tAddressValues);
  }, [addressKind])

  function onSave() {
    if (!addressValues.address1) {
      Alert.alert(
        'Please enter address1',
        '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
      );
      return;
    }
    if (!addressValues.city) {
      Alert.alert(
        'Please enter city',
        '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
      );
      return;
    }
    if (!addressValues.country) {
      Alert.alert(
        'Please select country',
        '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
      );
      return;
    }

    if (Constants.processType === 'user') updateUser();
    else if (Constants.processType === 'child') updateChild();
  }

  function updateUser(){
    setSpinner(true);

    var addressItem = {
      address1: addressValues.address1,
      address2: addressValues.address2,
      city: addressValues.city,
      country: addressValues.country
    }

    var nUser = { ...Constants.user }
    nUser.location = Constants.location;
    nUser.address[addressKind] = addressItem;
    nUser.profileStep = 3;

    setData('users', 'update', nUser)
      .then(() => {
        Constants.user = nUser;
        AsyncStorage.setItem('userdemouser', JSON.stringify(Constants.user));
        setRefresh(!refresh);
        setSpinner(false);
      })
      .catch(err => {
        console.log('update data error', err);
        Alert.alert(
          'Update data failed.',
          '',
          [
            { text: "OK", onPress: () => setSpinner(false) }
          ],
        );
      })
  }

  function updateChild(){
    setSpinner(true);

    var addressItem = {
      address1: addressValues.address1,
      address2: addressValues.address2,
      city: addressValues.city,
      country: addressValues.country
    }

    var nUser = { ...Constants.child }    
    nUser.address[addressKind] = addressItem;
    nUser.profileStep = 3;

    setData('childs', 'update', nUser)
      .then(() => {
        Constants.child = nUser;        
        setRefresh(!refresh);
        setSpinner(false);
      })
      .catch(err => {
        console.log('update data error', err);
        Alert.alert(
          'Update data failed.',
          '',
          [
            { text: "OK", onPress: () => setSpinner(false) }
          ],
        );
      })
  }

  function onNext() {
    if (Constants.processType === 'user' && !Constants.user.address.home && !Constants.user.address.work && !Constants.user.address.other) {
      Alert.alert(
        'Please enter any address at least 1',
        '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
      );
      return;
    }

    navigation.navigate('Preferences');
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
          <TouchableOpacity onPress={() => { navigation.navigate('Detail') }}>
            <Text style={styles.sideTxt}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Address</Text>
        </View>
        <View style={styles.sideContainer}>
          {/* <TouchableOpacity onPress={() => { }}>
            <Text style={styles.sideTxt}>Cancel</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>

        <View style={styles.mapBox}>
          {
            (Constants.location.latitude && Constants.location.longitude) ?
              <MapView
                initialRegion={{
                  latitude: Constants.location.latitude,
                  longitude: Constants.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsCompass={true}
                showsPointsOfInterest={false}
                zoomControlEnabled={true}
                style={{ flex: 1 }}
              />
              :
              null
          }
        </View>

        <View style={styles.addressBtnRow}>
          <TouchableOpacity style={[styles.adderssBtn, addressKind === 'home' ? { borderColor: Colors.red } : null, Constants.user.address.home ? { backgroundColor: Colors.yellow } : null]} onPress={() => { setAddressKind('home') }}>
            <Text style={styles.addressBtnTxt}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.adderssBtn, addressKind === 'work' ? { borderColor: Colors.red } : null, Constants.user.address.work ? { backgroundColor: Colors.yellow } : null]} onPress={() => { setAddressKind('work') }}>
            <Text style={styles.addressBtnTxt}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.adderssBtn, addressKind === 'other' ? { borderColor: Colors.red } : null, Constants.user.address.other ? { backgroundColor: Colors.yellow } : null]} onPress={() => { setAddressKind('other') }}>
            <Text style={styles.addressBtnTxt}>Other</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter address1  *'}
          placeholderTextColor={Colors.grey}
          value={addressValues.address1}
          onChangeText={(text) => { var tAddressValues = { ...addressValues, address1: text }; setAddressValues(tAddressValues) }}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter address2'}
          placeholderTextColor={Colors.grey}
          value={addressValues.address2}
          onChangeText={(text) => { var tAddressValues = { ...addressValues, address2: text }; setAddressValues(tAddressValues) }}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter city  *'}
          placeholderTextColor={Colors.grey}
          value={addressValues.city}
          onChangeText={(text) => { var tAddressValues = { ...addressValues, city: text }; setAddressValues(tAddressValues) }}
        >
        </TextInput>

        <View style={{ width: '80%', marginTop: normalize(20, 'height') }}>
          <DropDownPicker
            items={countries}
            defaultValue={addressValues.country ? addressValues.country : null}
            placeholder='Please enter country'
            placeholderStyle={{
              fontSize: RFPercentage(2.4),
              color: Colors.grey
            }}
            labelStyle={{
              fontSize: RFPercentage(2.4),
              color: Colors.grey,
              textAlign: 'center'
            }}
            containerStyle={{ width: '100%', height: normalize(45, 'height') }}
            style={{ backgroundColor: 'transparent' }}
            dropDownStyle={{ backgroundColor: 'transparent' }}
            onChangeItem={(item) => { var tAddressValues = { ...addressValues, country: item.value }; setAddressValues(tAddressValues) }}
            showArrow={false}
            dropDownMaxHeight={normalize(120, 'height')}
            onOpen={() => setCountryDropShow(true)}
            onClose={() => setCountryDropShow(false)}
          />
        </View>

        <View style={[styles.btnRow, countryDropShow ? { marginTop: normalize(140, 'height') } : null]}>
          <TouchableOpacity style={styles.btn} onPress={() => onSave()}>
            <Text style={styles.btnTxt}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => onNext()}>
            <Text style={styles.btnTxt}>Next {'>>'}</Text>
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
    // justifyContent: 'center',
    // alignItems: 'center'
  },

  mapBox: {
    width: '90%',
    height: normalize(150, 'height')
  },

  addressBtnRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(20, 'height')
  },
  adderssBtn: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    borderWidth: normalize(3),
    borderColor: Colors.grey,
    justifyContent: 'center',
    alignItems: 'center'
  },

  inputBox: {
    width: '80%',
    height: normalize(45, 'height'),
    fontSize: RFPercentage(2.5),
    borderColor: Colors.grey,
    borderWidth: normalize(3),
    marginTop: normalize(20, 'height'),
    paddingLeft: normalize(10),
  },

  btnRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(20, 'height'),
    marginBottom: normalize(20, 'height')
  },
  btn: {
    width: '30%',
    height: normalize(45, 'height'),
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    // marginTop: normalize(20, 'height')
  },
  btnTxt: {
    fontSize: RFPercentage(2.2),
    color: Colors.black
  },
});