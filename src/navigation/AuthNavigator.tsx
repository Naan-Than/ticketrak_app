import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from '../pages/auth/LoginScreen';
import RegistrationScreen from '../pages/auth/RegistrationScreen';

const AuthNavigator = () => {
  const AuthStack = createStackNavigator();

  return (
    <SafeAreaView style={{ flex: 1 }}
      edges={['left', 'right']}
    >
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}
        initialRouteName='LoginScreen'>
        <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
        <AuthStack.Screen name="RegistrationScreen" component={RegistrationScreen} />
      </AuthStack.Navigator>
    </SafeAreaView>
  );
};

export default AuthNavigator;
