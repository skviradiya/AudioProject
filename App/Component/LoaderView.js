import React from 'react';
import {ActivityIndicator, Dimensions, Text, View, Modal} from 'react-native';

const {width, height} = Dimensions.get('window');
export default function LoaderView({isModalVisible, loaderTitle}) {
  return (
    <Modal visible={isModalVisible} animationType="fade" transparent>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
        <View
          style={{
            width: width - 100,
            height: height / 10,
            backgroundColor: 'white',
            borderRadius: 5,
            elevation: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <ActivityIndicator size={'large'} />
            <Text
              style={{
                fontSize: 20,
                marginHorizontal: 20,
                color: 'black',
              }}>
              {loaderTitle}...
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
