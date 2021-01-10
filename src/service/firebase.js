import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import NetInfo from '@react-native-community/netinfo';

export const checkInternet = async () => {
  return NetInfo.fetch().then(state => {
    return state.isConnected;
  })
}

export const signin = (email, password) => {
  return new Promise((resolve, reject) => {
    auth().signInWithEmailAndPassword(email, password)
      .then((res) => {
        resolve(getUser(res.user.uid));
      })
      .catch((err) => {
        reject(err);
      });
  })
}

export const signinWithPhoneNumber = async (phoneNumber) => {  
  const confirmation = await auth().signInWithPhoneNumber(phoneNumber)  
  return confirmation;
}

export const signup = (email, password) => {
  return new Promise((resolve, reject) => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  })
}

export const signOut = () => {
  auth().signOut();
}

export const createUser = (userInfo) => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('users')
      .doc(userInfo.id)
      .set(userInfo)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      })
  })
}

export const getUser = (id) => {
  return new Promise((resolve, reject) => {
    firebase.firestore()
      .collection('users')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if (doc.data().id == id) {
            resolve(doc.data());
          }
        })
        resolve('no exist');
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const getData = (kind = '') => {
  return new Promise((resolve, reject) => {
    firebase.firestore()
      .collection(kind)
      .get()
      .then(snapshot => {
        var data = [];
        snapshot.forEach(doc => {
          var obj = doc.data();
          Object.assign(obj, { id: doc.id });
          data.push(obj);
        })
        resolve(data);
      })
      .catch(err => {
        reject(err);
      })
  })
}

export const setData = (kind = '', act, item) => {
  return new Promise((resolve, reject) => {
    if (act == 'add') {
      firebase.firestore()
        .collection(kind)
        .add(item)
        .then((res) => {
          var itemWithID = { ...item, id: res.id };
          firebase.firestore()
            .collection(kind)
            .doc(res.id)
            .update(itemWithID)
            .then((response) => {
              resolve(res)
            })
            .catch((err) => {
              reject(err);
            })
        })
        .catch(err => {
          reject(err);
        })
    }
    else if (act == 'update') {      
      firebase.firestore()
        .collection(kind)
        .doc(item.id)
        .update(item)
        .then(() => {
          resolve();          
        })
        .catch(err => {
          reject(err);
        })
    }
    else if (act == 'delete') {
      firebase.firestore()
        .collection(kind)
        .doc(item.id)
        .delete()
        .then(() => {
          console.log(kind, act)
          resolve();
        })
        .catch(err => {
          reject(err);
        })
    }
  })
}

export const uploadMedia = (folder, name, path) => {
  var milliSeconds = new Date().getTime();
  return new Promise((resolve, reject) => {

    let ref = storage().ref(`${folder}/${name}`);

    ref.putFile(path)
      .then(async (res) => {
        downloadURL = await ref.getDownloadURL();
        resolve(downloadURL);
      })
      .catch((err) => {
        reject(err);
      });
  })
}


