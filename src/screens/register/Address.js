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
import RNCountry from "react-native-countries";

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, setData, checkInternet } from '../../service/firebase';

export default function Address({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  const [addressKind, setAddressKind] = useState('home');
  const [activeAddress, setActiveAddress] = useState({});
  const [address, setAddress] = useState({
    home: {},
    work: {},
    other: {}
  })
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState();

  useEffect(() => {
    let countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
    countryNamesWithCodes.sort((a, b) => a.name.localeCompare(b.name));
    var tCountries = countryNamesWithCodes.map((each, index) => ({
      label: each.name,
      value: each.code
    }))
    setCountries(tCountries)
  }, []);

  function onSave(){

  }

  function onNext(){
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
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <Text style={styles.sideTxt}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Save your address</Text>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.sideTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>

        <View style={styles.mapBox}>
          {
            Constants.location.latitude && Constants.location.longitude &&
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
          }
        </View>

        <View style={styles.addressBtnRow}>
          <TouchableOpacity style={[styles.adderssBtn, addressKind === 'home' ? {borderColor: Colors.red}:null]} onPress={() => {setAddressKind('home')}}>
            <Text style={styles.addressBtnTxt}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.adderssBtn, addressKind === 'work' ? {borderColor: Colors.red}:null]} onPress={() => {setAddressKind('work')}}>
            <Text style={styles.addressBtnTxt}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.adderssBtn, addressKind === 'other' ? {borderColor: Colors.red}:null]} onPress={() => {setAddressKind('other')}}>
            <Text style={styles.addressBtnTxt}>Other</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter address1  *'}
          placeholderTextColor={Colors.grey}
          value={activeAddress.address1}
          onChangeText={(text) => { activeAddress.address1 = text }}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter address2'}
          placeholderTextColor={Colors.grey}
          value={activeAddress.address2}
          onChangeText={(text) => { activeAddress.address2 = text }}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter city  *'}
          placeholderTextColor={Colors.grey}
          value={activeAddress.city}
          onChangeText={(text) => { activeAddress.city = text }}
        >
        </TextInput>

        <View style={{ width: '80%', marginTop: normalize(20, 'height') }}>
          <DropDownPicker
            items={countries}
            defaultValue={country}
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
            containerStyle={{ width: '100%', height: normalize(45, 'height'), borderWidth: normalize(3) }}
            style={{ backgroundColor: 'transparent' }}
            itemStyle={{ justifyContent: 'center' }}
            dropDownStyle={{ backgroundColor: 'transparent' }}
            onChangeItem={item => setCountry(item.value)}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} onPress={() => onSave()}>
            <Text style={styles.btnTxt}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => onNext()}>
            <Text style={styles.btnTxt}>Next {'>>'}</Text>
          </TouchableOpacity>
        </View>
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
  sideTxt: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    color: Colors.black,
  },

  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  mapBox: {
    width: '90%',
    height: '30%'
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
    justifyContent: 'space-between'
  },
  btn: {
    width: '30%',
    height: normalize(45, 'height'),
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: normalize(20, 'height')
  },
  btnTxt: {
    fontSize: RFPercentage(2.2),
    color: Colors.black
  },
});