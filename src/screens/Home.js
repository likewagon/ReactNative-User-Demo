import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

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
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
EntypoIcon.loadFont();
FontAwesomeIcon.loadFont();
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';
import {
  Menu, MenuOptions, MenuOption, MenuTrigger
} from 'react-native-popup-menu';

import { Colors, Images, Constants } from '@constants';
import { signup, createUser, getData, setData, checkInternet } from '../service/firebase';
import database from '@react-native-firebase/database';

export default function Home({ navigation }) {
  const [spinner, setSpinner] = useState(false);

  const [toggleMenu, setToggleMenu] = useState(false);
  const [toggleProfile, setToggleProfile] = useState(false);
  const [toggleProfileModal, setToggleProfileModal] = useState(false);
  const [toggleChildModal, setToggleChildModal] = useState(false);

  const [users, setUsers] = useState(Constants.users.filter(each => each.name && each.id != Constants.user.id));
  const [usersStatus, setUsersStatus] = useState([]);
  const [user, setUser] = useState(); //for popup user
  const [childs, setChilds] = useState([]);

  useEffect(() => {
    const reference = database().ref(`/online/${Constants.user.id}`);
    reference.set('online').then(() => {
      // console.log('online presence set')
    });
    reference.onDisconnect().set(database.ServerValue.TIMESTAMP).then(() => {
      // console.log('offline timestamp')
    });

    const allRef = database().ref(`/online`);
    allRef.on('value', snapshot=>{
      var usersStatus = snapshot.val();
      setUsersStatus(usersStatus);
    })    
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await getData('childs')
        .then(res => {
          Constants.childs = res;
          var childs = Constants.childs.filter(each => each.name && each.pid == Constants.user.id);
          setChilds(childs);
        })
        .catch(err => { console.log('loading childs error', err) });
    });
    return unsubscribe;
  }, [navigation]);

  function onMenu(value) {
    if (value === 'home') {
      navigation.navigate('Home');
    }
    else if (value === 'addChild') {
      var child = {
        name: '',
        phone: Constants.user.phone,
        age: '',
        gender: '',
        height: '',
        weight: '',
        photo: '',
        address: {
          home: Constants.user.address.home,
          work: Constants.user.address.work,
          other: Constants.user.address.other
        },
        foods: [],
        landscapes: [],
        preference: '',
        medication: '',
        allergy: '',
        otherinfo: '',
        pid: Constants.user.id
      }

      setSpinner(true);
      setData('childs', 'add', child)
        .then((res) => {
          setSpinner(false);
          Constants.child = res;
          Constants.processType = 'child';
          navigation.navigate('Register', { screen: 'Detail' });
        })
        .catch(err => {
          console.log('add child error', err);
        })
    }
    else if (value === 'editChild') {
      setToggleChildModal(true);
    }
    else if (value === 'terms') {

    }
  }

  function onProfile(value) {
    if (value == 'view') {
      setUser(Constants.user);
      setToggleProfileModal(true);
    }
    else if (value == 'edit') {
      Constants.processType = 'user';
      navigation.navigate('Register', { screen: 'Detail' })
    }
  }

  function onUser(user) {
    setUser(user);
    setToggleProfileModal(true)
  }

  function onEditChild(child) {
    Constants.processType = 'child';
    Constants.child = child;
    setToggleChildModal(false);
    navigation.navigate('Register', { screen: 'Detail' });
  }

  function renderUser(item) {        
    let statusValue = usersStatus[item.id];    
    let lastSeenDate, lastSeenTime;
    if(statusValue !== 'online'){
      lastSeenDate = new Date(statusValue).toLocaleDateString("en-US");
      lastSeenTime = new Date(statusValue).toLocaleTimeString("en-US");
    }

    return (
      <TouchableOpacity key={item.id} style={styles.userRow} onPress={() => onUser(item)}>
        <View style={styles.photoPart}>
          <View style={styles.photoBox}>
            <Image style={styles.photoImg} source={{ uri: item.photo }} resizeMode='cover' />
            <View style={[styles.statusCircle, statusValue === 'online' ? { backgroundColor: Colors.green } : { backgroundColor: Colors.yellow }]}></View>
          </View>
        </View>
        <View style={styles.txtPart}>
          <View style={styles.txtTopRow}>
            <Text style={styles.itemTxt}>{item.name}, {item.age}yrs, {item.weight}kg</Text>
          </View>
          {
            statusValue !== 'online' ?
              <View style={styles.txtBottomRow}>
                <Text style={styles.itemTxt}>Last seen at {`${lastSeenTime}, ${lastSeenDate}`}</Text>
              </View>
              :
              null
          }
        </View>
      </TouchableOpacity>
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
              {/* <MenuOption value='terms' text='Terms and Conditions' /> */}
            </MenuOptions>
          </Menu>

        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt}>Home Page</Text>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity onPress={() => { }}>

            <Menu opened={toggleProfile} onSelect={(value) => { onProfile(value); setToggleProfile(!toggleProfile); }}>
              <MenuTrigger onPress={() => setToggleProfile(!toggleProfile)}>
                <Image style={styles.iconImg} source={Constants.user?.photo ? { uri: Constants.user.photo } : Images.defaultPhoto} resizeMode='cover' />
              </MenuTrigger>
              <MenuOptions customStyles={{ optionText: { fontSize: RFPercentage(2.2), paddingLeft: normalize(5) } }}>
                <MenuOption value='view' text='View Profile' />
                <MenuOption value='edit' text='Edit Profile' />
              </MenuOptions>
            </Menu>

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
        <View style={{ width: '100%' }}></View>
      </ScrollView>

      {
        toggleProfileModal &&
        <ProfileModal user={user} toggleProfileModal={() => setToggleProfileModal(!toggleProfileModal)} />
      }
      {
        toggleChildModal &&
        <ChildModal childs={childs} toggleChildModal={() => setToggleChildModal(!toggleChildModal)} editChild={onEditChild} />
      }
    </KeyboardAvoidingView>

  );
}

const ProfileModal = ({ user, toggleProfileModal }) => {
  const foods = Constants.foods.filter(each => user.foods.includes(each.id));
  const landscapes = Constants.landscapes.filter(each => user.landscapes.includes(each.id));

  return (
    <Modal isVisible={true} >
      <View style={styles.modalBody}>
        <TouchableOpacity onPress={() => { toggleProfileModal(false) }}>
          <FontAwesomeIcon name="close" style={{ alignSelf: 'flex-end', fontSize: RFPercentage(3) }}></FontAwesomeIcon>
        </TouchableOpacity>
        <View style={styles.photoBox}>
          <Image style={styles.photo} source={user.photo ? { uri: user.photo } : Images.defaultPhoto} resizeMode='cover' />
        </View>
        <Text style={styles.txt}>{user.name}</Text>
        <Text style={styles.txt}>{user.phone}</Text>
        <View style={styles.txtRow}>
          <Text style={styles.txt}>{user.gender}</Text>
          <Text style={styles.txt}>{user.age}yrs</Text>
        </View>
        <View style={styles.txtRow}>
          <Text style={styles.txt}>H: {user.height}</Text>
          <Text style={styles.txt}>W: {user.weight}kg</Text>
        </View>

        <ScrollView>
          {
            user.address.home &&
            <Text style={styles.txt}>{user.address.home.address1}, {user.address.home.address2}, {user.address.home.city}, {user.address.home.country}</Text>
          }
          {
            user.address.work ?
              <Text style={styles.txt}>{user.address.work.address1}, {user.address.work.address2}, {user.address.work.city}, {user.address.work.country}</Text>
              :
              null
          }
          {
            user.address.other ?
              <Text style={styles.txt}>{user.address.other.address1}, {user.address.other.address2}, {user.address.other.city}, {user.address.other.country}</Text>
              : null
          }

          <View style={styles.tagPart}>
            {
              foods.map((each, index) => <Text key={index} style={[styles.txt, { marginTop: normalize(5, 'height'), marginRight: normalize(10) }]}>{each.name}</Text>)
            }
          </View>

          <View style={styles.tagPart}>
            {
              landscapes.map((each, index) => <Text key={index} style={[styles.txt, { marginTop: normalize(5, 'height'), marginRight: normalize(10) }]}>{each.name}</Text>)
            }
          </View>

          <Text style={styles.txt}>{user.preference}</Text>
          <Text style={styles.txt}>{user.medication}</Text>
          <Text style={styles.txt}>{user.allergy}</Text>
          <Text style={styles.txt}>{user.otherinfo}</Text>

          <FlatList
            keyExtractor={(item, index) => item.id}
            horizontal={true}
            data={user.pictures}
            style={{ margin: normalize(10) }}
            renderItem={({ item }) => (
              <Image style={styles.pictureImg} source={{ uri: item.uri }} resizeMode='cover' />
            )}
          />

        </ScrollView>
      </View>
    </Modal>
  )
}

const ChildModal = ({ childs, toggleChildModal, editChild }) => {
  return (
    <Modal isVisible={true} >
      <View style={[styles.modalBody, { width: '100%', height: '50%' }]}>
        <TouchableOpacity onPress={() => { toggleChildModal(false) }}>
          <FontAwesomeIcon name="close" style={{ alignSelf: 'flex-end', fontSize: RFPercentage(3) }}></FontAwesomeIcon>
        </TouchableOpacity>
        <FlatList
          keyExtractor={(item, index) => item.id}
          horizontal={true}
          data={childs}
          style={{ margin: normalize(10) }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.childBox} onPress={() => editChild(item)}>
              <View style={styles.photoBox}>
                <Image style={styles.photo} source={item.photo ? { uri: item.photo } : Images.defaultPhoto} resizeMode='cover' />
              </View>
              <Text style={styles.txt}>{item.name}</Text>
              <Text style={styles.txt}>{item.phone}</Text>
              <View style={styles.txtRow}>
                {item.gender ? <Text style={styles.txt}>{item.gender}</Text> : null}
                {item.age ? <Text style={styles.txt}>{item.age}yrs</Text> : null}
              </View>
              <View style={styles.txtRow}>
                {item.height ? <Text style={styles.txt}>H: {item.height}</Text> : null}
                {item.weight ? <Text style={styles.txt}>W: {item.weight}kg</Text> : null}
              </View>
            </TouchableOpacity>
          )}
        />
        {
          childs.length == 0 &&
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.sideTxt}>No Childs</Text>
          </View>
        }
      </View>
    </Modal>
  )
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
  iconImg: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(15)
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
    height: normalize(100, 'height'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoPart: {
    width: '30%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBox: {
    width: normalize(90),
    height: normalize(90),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(45),
    borderWidth: normalize(3),
    borderColor: Colors.grey
  },
  photoImg: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(45),
  },
  statusCircle: {
    position: 'absolute',
    left: normalize(60),
    top: normalize(60),
    width: normalize(15),
    height: normalize(15),
    borderRadius: normalize(10),    
  },

  txtPart: {
    width: '65%',
    height: '80%',
    justifyContent: 'center'
  },
  txtTopRow: {
    width: '100%',
    minHeight: '40%',    
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: normalize(5),
  },
  txtBottomRow: {
    width: '100%',
    height: '40%',
    paddingLeft: normalize(5),
  },
  statusPart: {
    width: '65%',
    height: '20%',
    paddingLeft: normalize(5),
    borderWidth: 2
  },
  itemTxt: {
    width: '100%',
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    color: Colors.black,
  },

  ///////////////

  modalBody: {
    width: '90%',
    height: '90%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    padding: normalize(20)
  },
  photoBox: {
    width: normalize(80),
    height: normalize(80),
    borderWidth: normalize(3),
    borderColor: Colors.grey,
    borderRadius: normalize(40),
    alignSelf: 'center',
    marginTop: normalize(10, 'height')
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(40),
  },
  txt: {
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    color: Colors.black,
    alignSelf: 'center',
    marginTop: normalize(15, 'height')
  },
  txtRow: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  tagPart: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: normalize(15, 'height')
  },
  pictureImg: {
    width: normalize(80),
    height: normalize(80),
    borderWidth: normalize(3),
    borderColor: Colors.grey,
    marginRight: normalize(10)
  },

  childBox: {
    width: normalize(130),
    height: normalize(350, 'height')
  },
});

