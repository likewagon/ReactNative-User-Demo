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
import DropDownPicker from 'react-native-dropdown-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Colors, Images, Constants } from '@constants';
import { getAges, getHeights, getWeights } from '@constants';
import { signup, createUser, setData, checkInternet, uploadMedia } from '../../service/firebase';

export default function Detail({ navigation }) {
  const [spinner, setSpinner] = useState(false);
  
  const [name, setName] = useState();
  const [phone, setPhone] = useState();
  const [age, setAge] = useState();
  const [gender, setGender] = useState();
  const [height, setHeight] = useState();
  const [weight, setWeight] = useState();
  const [photo, setPhoto] = useState();

  const [ages, setAges] = useState(getAges());
  const [heights, setHeights] = useState(getHeights());
  const [weights, setWeights] = useState(getWeights());

  const [ageDropShow, setAgeDropShow] = useState(false);
  const [heightDropShow, setHeightDropShow] = useState(false);
  const [weightDropShow, setWeightDropShow] = useState(false);

  useEffect( ()=>{
    const unsubscribe = navigation.addListener('focus', async ()=>{      
      const initialUser = Constants.processType === 'user' ? Constants.user : Constants.child;
      setName(initialUser.name);
      setPhone(initialUser.phone);
      setAge(initialUser.age);
      setGender(initialUser.gender);
      setHeight(initialUser.height);
      setWeight(initialUser.weight);
      setPhoto(initialUser.photo);
      console.log('every detail', Constants.processType)
    });
    return unsubscribe;        
  }, [navigation]);

  onPhotoLoad = () => {
    var options = {
      mediaType: 'photo',
      maxWidth: normalize(100),
      maxHeight: normalize(100)
    }

    launchImageLibrary(options, response => {
      if (response.didCancel) {
      } else if (response.errorMessage) {
        Alert.alert('Loading Photo Failed.');
      } else {
        setPhoto(response.uri)
      }
    })
  };

  uploadPhoto = () => {
    return new Promise(async (resolve, reject) => {
      var platformPhotoLocalPath = Platform.OS === "android" ? photo : photo.replace("file://", "")
      var filename = Constants.processType === 'user' ? Constants.user?.id : Constants.child?.id;

      await uploadMedia('photos', filename, platformPhotoLocalPath)
        .then((downloadURL) => {
          if (!downloadURL) return;
          // console.log('downloadURL', downloadURL)
          if (Constants.processType === 'user') Constants.user.photo = downloadURL;
          else if (Constants.processType === 'child') Constants.child.photo = downloadURL;
          resolve();
        })
        .catch((err) => {
          console.log('upload photo error', err);
          reject(err);
        })
    })
  }

  async function onNext() {
    if (!name) {
      Alert.alert('Please enter name');
      return;
    }

    setSpinner(true);
    if (photo && !photo.includes('https://')) {
      await uploadPhoto()
        .then(() => {
          if (Constants.processType === 'user') updateUser();
          else if (Constants.processType === 'child') updateChild();
        })
        .catch((err) => {
          console.log('upload photo error', err);
          Alert.alert(
            'Upload photo failed.',
            '',
            [
              { text: "OK", onPress: () => setSpinner(false) }
            ],
          );
        })
    }
    else {
      if (Constants.processType === 'user') updateUser();
      else if (Constants.processType === 'child') updateChild();
    }
  }

  function updateUser() {
    Constants.user.name = name;
    if (age) Constants.user.age = age;
    if (gender) Constants.user.gender = gender;
    if (height) Constants.user.height = height;
    if (weight) Constants.user.weight = weight;
    Constants.user.profileStep = 2;

    setData('users', 'update', Constants.user)
      .then(() => {
        setSpinner(false);
        AsyncStorage.setItem('userdemouser', JSON.stringify(Constants.user));
        navigation.navigate('Address');
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

  function updateChild() {
    Constants.child.name = name;
    if (age) Constants.child.age = age;
    if (gender) Constants.child.gender = gender;
    if (height) Constants.child.height = height;
    if (weight) Constants.child.weight = weight;
    Constants.child.profileStep = 2;
    
    setData('childs', 'update', Constants.child)
      .then(() => {
        setSpinner(false);        
        navigation.navigate('Address');
      })
      .catch(err => {
        console.log('update child error', err);
        Alert.alert(
          'Update child failed.',
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
          {/* <TouchableOpacity onPress={() => {}}>
            <EntypoIcon name="user" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity> */}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Details</Text>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.sideTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter full name  *'}
          placeholderTextColor={Colors.grey}
          value={name}
          onChangeText={(text) => setName(text)}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholderTextColor={Colors.grey}
          value={phone}
          onChangeText={(text)=>setPhone(text)}
          editable={Constants.processType === 'user' ? false : true}
        >
        </TextInput>

        <View style={{ width: '80%', marginTop: normalize(20, 'height') }}>
          <DropDownPicker
            items={ages}
            defaultValue={age ?? ''}
            placeholder='Please enter age'
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
            onChangeItem={(item) => setAge(item.value)}
            showArrow={false}
            zIndex={300}
            dropDownMaxHeight={normalize(120, 'height')}
            onOpen={() => setAgeDropShow(true)}
            onClose={() => setAgeDropShow(false)}
          />
        </View>

        <View style={[styles.genderRow, ageDropShow ? { marginTop: normalize(120, 'height') } : null]}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderRadius: normalize(10), borderWidth: normalize(3) }, gender === 'Male' ? { borderColor: Colors.red } : { borderColor: Colors.grey }]} onPress={() => setGender('Male')}>
            <Text style={styles.btnTxt}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderRadius: normalize(10), borderWidth: normalize(3) }, gender === 'Female' ? { borderColor: Colors.red } : { borderColor: Colors.grey }]} onPress={() => setGender('Female')}>
            <Text style={styles.btnTxt}>Female</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hwRow}>
          <View style={{ width: '45%' }}>
            <DropDownPicker
              items={heights}
              defaultValue={height ?? ''}
              placeholder='Please enter height'
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
              onChangeItem={(item) => setHeight(item.value)}
              showArrow={false}
              dropDownMaxHeight={normalize(120, 'height')}
              onOpen={() => setHeightDropShow(true)}
              onClose={() => setHeightDropShow(false)}
            />
          </View>
          <View style={{ width: '45%' }}>
            <DropDownPicker
              items={weights}
              defaultValue={weight ?? ''}
              placeholder='Please enter weight'
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
              onChangeItem={(item) => setWeight(item.value)}
              showArrow={false}
              dropDownMaxHeight={normalize(120, 'height')}
              onOpen={() => setWeightDropShow(true)}
              onClose={() => setWeightDropShow(false)}
            />
          </View>
        </View>

        <View style={[styles.photoNextRow, (heightDropShow || weightDropShow) ? { marginTop: normalize(140, 'height') } : null]}>
          <View style={styles.photoPart}>
            <View style={styles.photoImgBox}>
              <TouchableOpacity style={styles.photoBtn} onPress={() => onPhotoLoad()}>
                {
                  photo ? 
                  <Image style={styles.photoImg} source={{ uri: photo }} resizeMode='cover' />
                  :
                  <>
                    <EntypoIcon name="plus" style={styles.photoTxt}></EntypoIcon>
                    <Text style={styles.photoTxt}>photo</Text>
                  </>
                }
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.btnPart}>
            <TouchableOpacity style={[styles.btn, { width: '50%' }]} onPress={() => onNext()}>
              <Text style={styles.btnTxt}>Next {'>>'}</Text>
            </TouchableOpacity>
          </View>
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
    marginTop: normalize(20, 'height'),
    paddingLeft: normalize(10),
  },

  genderRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },

  hwRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(20, 'height')
  },

  photoNextRow: {
    width: '80%',
    height: normalize(90, 'height'),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: normalize(20, 'height'),
    marginBottom: normalize(20, 'height'),
  },
  photoPart: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoImgBox: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    borderWidth: normalize(3),
    borderColor: Colors.grey
  },
  photoImg: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(45)
  },
  photoBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoTxt: {
    fontSize: RFPercentage(2.5),
    color: Colors.blackColor,
  },

  btnPart: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  btn: {
    width: '40%',
    height: normalize(45, 'height'),
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(20, 'height')
  },
  btnTxt: {
    fontSize: RFPercentage(2.2),
    color: Colors.black
  },
});