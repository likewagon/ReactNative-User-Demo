//firestore document
const user_item = {
  id: '', //string unique id
  name: '', //string
  phone: '', //string
  age: '', //number
  gender: '', //string Male/Female
  height: '', //string 5'10"
  weight: '', //number
  photo: '', //string
  address: { 
    home: '', //address_item
    work: '',
    other: ''
  },
  location: {
    latitude: '', //float
    longitude: '' //float
  },
  foods: [], //array of string array of food_id
  landscapes: [], //array of string array of landscape_id
  preference: '', //string
  medication: '', //string
  allergy: '', //string
  otherinfo: '', //string
  pictures: [], //array of string
  pid: '', //string parent_id
  profileStep: '', //number 0:signup 1:detail 2:address 3:preferences 4:pictures
}

const address_item = {
  address1: '', //string
  address2: '', //string
  city: '', //string
  country: '' //string  
}

const food_item = {
  id: '', //string
  name: '', //string
  dispOrder: ''//number
}

const landscape_item = {
  id: '', //string
  name: '', //string
  dispOrder: '' //number
}


