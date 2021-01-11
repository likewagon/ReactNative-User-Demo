import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './screens/Splash';

import Signup from './screens/register/Signup';
import Detail from './screens/register/Detail';
import Address from './screens/register/Address';
import Preferences from './screens/register/Preferences';
import Pictures from './screens/register/Pictures';

import Home from './screens/Home';
import Profile from './screens/Profile';

import { Colors } from '@constants';

const Stack = createStackNavigator();

function RegisterStack() {
  return (
    <Stack.Navigator
      headerMode='none'
      initialRouteName='Signup'
    >
      <Stack.Screen
        name='Signup'
        component={Signup}
      />      
      <Stack.Screen
        name='Detail'
        component={Detail}
      />      
      <Stack.Screen
        name='Address'
        component={Address}
      />      
      <Stack.Screen
        name='Preferences'
        component={Preferences}
      />      
      <Stack.Screen
        name='Pictures'
        component={Pictures}
      />      
    </Stack.Navigator>
  )
}

function MainStack() {
  return (
    <Stack.Navigator
      headerMode='none'
      initialRouteName='Home'
    >
      <Stack.Screen
        name='Home'
        component={Home}
      />      
      <Stack.Screen
        name='Profile'
        component={Profile}
      />      
    </Stack.Navigator>
  )
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode='none' initialRouteName="Splash" screenOptions={{ cardStyle: {backgroundColor: Colors.blackColor }}}>
        <Stack.Screen name='Splash' component={Splash} />
        <Stack.Screen name='Register' component={RegisterStack} />
        <Stack.Screen name='Main' component={MainStack} />        
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;