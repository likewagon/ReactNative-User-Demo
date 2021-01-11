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
import Modal from 'react-native-modal';
import {
  Menu, MenuOptions, MenuOption, MenuTrigger
} from 'react-native-popup-menu';

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, setData, checkInternet } from '../service/firebase';

export default function Home({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  const [toggleMenu, setToggleMenu] = useState(false);

  const [users, setUsers] = useState(Constants.users);

  function onMenu(value) {
    if (value === 'home') {
      navigation.navigate('Home');
    }
    else if (value === 'addChild') {
      navigation.navigate('Register', { pid: Constants.user?.id })
    }
    else if (value === 'editChild') {

    }
    else if (value === 'terms') {

    }
  }

  function renderUser(item) {
    // console.log('user', item)
    return (
      <View key={item.id} style={styles.userRow}>
        <View style={styles.photoBox}>
          <Image style={styles.photoImg} source={{ uri: item.photo }} resizeMode='stretch' />
        </View>
        <View style={styles.txtBox}>
          <Text style={styles.itemTxt}>{item.name}, {item.age}yrs, {item.weight}kg</Text>
        </View>
      </View>
    )
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

          <Menu opened={toggleMenu} onSelect={(value) => { onMenu(value); setToggleMenu(!toggleMenu); }}>
            <MenuTrigger onPress={() => setToggleMenu(!toggleMenu)}>
              <EntypoIcon name="menu" style={styles.headerIcon}></EntypoIcon>
            </MenuTrigger>
            <MenuOptions customStyles={{ optionText: { fontSize: RFPercentage(2.2), paddingLeft: normalize(5) } }}>
              <MenuOption value='home' text='Home' />
              <MenuOption value='addChild' text='Add Child' />
              <MenuOption value='editChild' text='Edit Child' />
              <MenuOption value='terms' text='Terms and Conditions' />
            </MenuOptions>
          </Menu>

        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Home Page</Text>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => { }}>
            <EntypoIcon name="user" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
        {
          users.length > 0 && users.map((each, index) => renderUser(each))
        }
        {
          users.length == 0 &&
          <Text style={[styles.sideTxt, { marginTop: normalize(250, 'height') }]}>No Users</Text>
        }
        <View style={{width: '100%'}}></View>
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

  userRow: {
    width: '90%',
    height: normalize(80, 'height'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  photoBox: {
    width: '30%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoImg: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    borderWidth: normalize(3),
    borderColor: Colors.grey
  },

  txtBox: {
    width: '65%',
    height: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: normalize(3),
    borderColor: Colors.grey,
    paddingLeft: normalize(5)
  },
  itemTxt: {
    width: '100%',
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    color: Colors.black,
  },
});