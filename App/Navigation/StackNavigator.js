import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import AudioPlayer from '../Screen/AudioPlayer';
import AudioRecording from '../Screen/AudioRecording';

const Stack = createNativeStackNavigator();
export default function StackNavigator(params) {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={AudioRecording} name="AudioRecording" />
      <Stack.Screen component={AudioPlayer} name="AudioPlayer" />
    </Stack.Navigator>
  );
}
