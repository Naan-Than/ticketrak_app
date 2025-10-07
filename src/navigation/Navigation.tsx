import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppDispatch, useAppSelector} from '../store/index';
import {useTheme} from 'react-native-paper';
import MainBottomNav from './MainBottomNav';
import AuthNavigator from './AuthNavigator';

const Stack = createStackNavigator();

export default function Navigation(props: any) {
  const {colors} = useTheme();
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const dispatch = useAppDispatch();
  console.log(isLoggedIn,'isLoggedInisLoggedIn')
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <NavigationContainer>
        {isLoggedIn ? <MainBottomNav /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaView>
  );
}
