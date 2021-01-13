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
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import normalize from 'react-native-normalize';
import { RFPercentage } from 'react-native-responsive-fontsize';

import EntypoIcon from 'react-native-vector-icons/Entypo';
EntypoIcon.loadFont();
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, setData, checkInternet } from '../../service/firebase';

export default function Preferences({ navigation }) {
  const [spinner, setSpinner] = useState(false);
  
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [selectedLandscapes, setSelectedLandscapes] = useState([]);
  const [preference, setPreference] = useState();
  const [medication, setMedication] = useState();
  const [allergy, setAllergy] = useState();
  const [otherinfo, setOtherinfo] = useState();

  const [foods, setFoods] = useState(Constants.foods);
  const [landscapes, setLandscapes] = useState(Constants.landscapes);

  useEffect( ()=>{
    const unsubscribe = navigation.addListener('focus', async ()=>{      
      const initialUser = Constants.processType === 'user' ? Constants.user : Constants.child;
      setSelectedFoods(initialUser.foods);
      setSelectedLandscapes(initialUser.landscapes);
      setPreference(initialUser.preference);
      setMedication(initialUser.medication);
      setAllergy(initialUser.allergy);
      setOtherinfo(initialUser.otherinfo);
    });
    return unsubscribe;        
  }, [navigation]);

  function onFoodItem(item){
    if(selectedFoods.includes(item.id)){
      var sFoods = [...selectedFoods];      
      sFoods.splice(sFoods.findIndex(each=>each == item.id), 1);
    }
    else{
      var sFoods = [...selectedFoods];
      sFoods.push(item.id);
    }
    setSelectedFoods(sFoods);
  }

  function onLandscapeItem(item){
    if(selectedLandscapes.includes(item.id)){
      var sLandscapes = [...selectedLandscapes];
      sLandscapes.splice(sLandscapes.findIndex(each=>each == item.id), 1);
    }
    else{
      var sLandscapes = [...selectedLandscapes];
      sLandscapes.push(item.id);
    }
    setSelectedLandscapes(sLandscapes);
  }

  function onNext(){
    
    if(selectedFoods.length == 0){
      Alert.alert(
        'Please select any food at least 1',
        '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
        );
        return;
      }
      
      if(selectedLandscapes.length == 0){
        Alert.alert(
          'Please select any landscape at least 1',
          '',
        [
          { text: "OK", onPress: () => setSpinner(false) }
        ],
      );
      return;
    }
    
    setSpinner(true);

    var nUser = Constants.processType === 'user' ? {...Constants.user} : {...Constants.child};
    nUser.foods = selectedFoods;
    nUser.landscapes = selectedLandscapes;
    if(preference) nUser.preference = preference;
    if(medication) nUser.medication = medication;
    if(allergy) nUser.allergy = allergy;
    if(otherinfo) nUser.otherinfo = otherinfo;    
    nUser.profileStep = 4;

    var collection = Constants.processType === 'user' ? 'users' : 'childs';
    setData(collection, 'update', nUser)
    .then(()=>{
      if(Constants.processType === 'user'){
        Constants.user = nUser;
        AsyncStorage.setItem('userdemouser', JSON.stringify(Constants.user));      
        setSpinner(false);
        navigation.navigate('Pictures');
      }
      else if(Constants.processType === 'child'){
        Constants.child = nUser;        
        setSpinner(false);
        navigation.navigate('Main', {screen: 'Home'});
      }
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image style={styles.imgBack} source={Images.authBack} />
      <Spinner
        visible={spinner}
        textContent={''}
      />
      <View style={styles.header}>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => { navigation.navigate('Address') }}>
            <Text style={styles.sideTxt}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Preferences</Text>
        </View>
        <View style={styles.sideContainer}>
          {/* <TouchableOpacity onPress={() => { }}>
            <Text style={styles.sideTxt}>Cancel</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.foodPart}>
          <Text style={styles.tipTxt}>Select Food  *</Text>
          <FlatList
            keyExtractor={(item, index) => item.id}
            data={foods}
            numColumns={2}
            style={{ margin: normalize(10) }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.itemBtn, selectedFoods.includes(item.id) ? {borderColor: Colors.red} : null]} onPress={()=>onFoodItem(item)}>
                <Text style={styles.itemTxt}>{item.name}</Text>
              </TouchableOpacity>
            )}
            columnWrapperStyle={{ justifyContent: 'space-around' }}
          />
        </View>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter preference'}
          placeholderTextColor={Colors.grey}
          value={preference}
          onChangeText={(text) => { setPreference(text) }}
        >
        </TextInput>

        <View style={styles.landscapePart}>
          <Text style={styles.tipTxt}>Select Landscape  *</Text>
          <FlatList
            keyExtractor={(item, index) => item.id}
            data={landscapes}
            numColumns={2}
            style={{ margin: normalize(10) }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.itemBtn, selectedLandscapes.includes(item.id) ? {borderColor: Colors.red} : null]} onPress={()=>onLandscapeItem(item)}>
                <Text style={styles.itemTxt}>{item.name}</Text>
              </TouchableOpacity>
            )}
            columnWrapperStyle={{ justifyContent: 'space-around' }}
          />
        </View>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter other medication'}
          placeholderTextColor={Colors.grey}
          value={medication}
          onChangeText={(text) => { setMedication(text) }}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter allergies'}
          placeholderTextColor={Colors.grey}
          value={allergy}
          onChangeText={(text) => { setAllergy(text) }}
        >
        </TextInput>

        <TextInput
          style={styles.inputBox}
          placeholder={'Please enter any other information'}
          placeholderTextColor={Colors.grey}
          value={otherinfo}
          onChangeText={(text) => { setOtherinfo(text) }}
        >
        </TextInput>

      </ScrollView>

      <View style={styles.btnRow}>        
        <TouchableOpacity style={styles.btn} onPress={() => onNext()}>
          {
            Constants.processType === 'user' && <Text style={styles.btnTxt}>Next {'>>'}</Text>
          }
          {
            Constants.processType === 'child' && <Text style={styles.btnTxt}>Finish</Text>
          }
          
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
  sideTxt: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    color: Colors.black,
  },

  body: {
    flex: 1,
  },

  foodPart: {
    width: '80%',
    alignItems: 'center',
    // marginTop: normalize(20, 'height'),
    borderWidth: normalize(3),
    borderColor: Colors.grey
  },
  tipTxt: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    color: Colors.black,
  },
  itemBtn: {
    width: '48%',
    height: normalize(30, 'height'),
    borderColor: Colors.grey,
    borderWidth: normalize(3),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(10, 'height')
  },
  itemTxt: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    color: Colors.black,
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
  inputBoxSmall: {
    width: '80%',
    height: normalize(45, 'height'),
    fontSize: RFPercentage(2.5),
    borderColor: Colors.grey,
    borderWidth: normalize(3),
    marginTop: normalize(20, 'height'),
    paddingLeft: normalize(10),
  },

  landscapePart: {
    width: '80%',
    alignItems: 'center',
    marginTop: normalize(20, 'height'),
    borderWidth: normalize(3),
    borderColor: Colors.grey
  },

  btnRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'center',
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
  },
  btnTxt: {
    fontSize: RFPercentage(2.2),
    color: Colors.black
  },
});