import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import StackNavigator from './App/Navigation/StackNavigator';

export default function App(params) {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
