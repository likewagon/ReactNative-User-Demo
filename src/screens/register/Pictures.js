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

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, setData, checkInternet } from '../../service/firebase';

export default function Pictures({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  const [picture, setPicture] = useState();
  const [pictures, setPictures] = useState(Constants.user?.pictures);

  function onPictureUpdate(item){

  }

  function onPicture(){

  }

  function onDone() {
    navigation.navigate('Home')
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
          pictures &&
          [pictures].map((each, index) => (
            <View style={styles.pictureImgBox}>
              <TouchableOpacity style={styles.pictureBtn} onPress={() => onPictureUpdate(each)}>
                {
                  each &&
                  <Image style={styles.pictureImg} source={{ uri: each }} resizeMode='stretch' />
                }                
              </TouchableOpacity>
            </View>
          ))
        }

        <View style={styles.pictureImgBox}>
          <TouchableOpacity style={styles.pictureBtn} onPress={() => onPicture()}>
            {
              picture &&
              <Image style={styles.pictureImg} source={{ uri: picture }} resizeMode='stretch' />
            }
            {
              !picture &&
              <>
                <EntypoIcon name="plus" style={styles.pictureTxt}></EntypoIcon>
                <Text style={styles.pictureTxt}>picture</Text>
              </>
            }
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
    borderWidth: normalize(3)
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