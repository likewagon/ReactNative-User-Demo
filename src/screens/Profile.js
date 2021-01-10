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
import { signup, createUser, setData, checkInternet } from '../service/firebase';

export default function Profile({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  return (
    <View></View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  }
});