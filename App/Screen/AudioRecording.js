import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ToastAndroid,
  Alert,
} from 'react-native';
import {
  checkIcon,
  deleteIcon,
  micIcon,
  pauseIcon,
  playIcon,
} from '../Assests/Icon';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import moment from 'moment';
import Slider from '@react-native-community/slider';
import MusicFiles from 'react-native-get-music-files';
import {RNAndroidAudioStore} from 'react-native-get-music-files';
import LoaderView from '../Component/LoaderView';

var RNFS = require('react-native-fs');
const audioRecorderPlayer = new AudioRecorderPlayer();

const {width, height} = Dimensions.get('window');
export default function AudioRecording({navigation}) {
  const [isRecording, setIsRecording] = useState(false);
  const [data, setData] = useState([]);
  const [recordingPause, setRecordingPause] = useState(true);
  const [recorderTime, setRecorderTime] = useState(null);
  const [recordingPath, setRecordingPath] = useState(null);
  const [loaderVisible, setLoaderVisible] = useState(false);

  useEffect(() => {
    try {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    } catch (err) {
      console.error(err);
    }
    getFolderAudio();
  }, []);

  const getFolderAudio = () => {
    let audioArray = [];
    RNFS.readDir(`${RNFS.ExternalStorageDirectoryPath}/Recording`).then(
      audioRes => {
        audioRes.forEach(value => {
          audioArray.push({
            fileName: value.name,
            path: value.path,
            mtime: value.mtime,
          });
        });
      },
    );

    getDeviceAudioData(audioArray);
  };
  const getDeviceAudioData = folderAudios => {
    MusicFiles.getAll({
      duration: true, //default : true
      cover: false, //default : true,
      id: true,
      minimumSongDuration: 1000, // get songs bigger than 10000 miliseconds duration,
    })
      .then(tracks => {
        let gettedData = [];
        tracks.forEach(trackData => {
          RNFS.stat(trackData.path).then(audioRes => {
            gettedData.push({
              fileName: trackData.fileName,
              path: trackData.path,
              mtime: audioRes.mtime,
            });
            if (folderAudios.length > 0) {
              const notSameData = gettedData.filter(deviceData => {
                return folderAudios.some(folderData => {
                  return deviceData.fileName !== folderData.fileName;
                });
              });
              const audioDataArray = [...folderAudios, ...notSameData];
              let tempData = [];
              audioDataArray.map(value => {
                tempData.push(value.mtime);
                tempData.sort(function (a, b) {
                  return b - a;
                });
              });
              let finalData = [];
              tempData.map(sortted => {
                audioDataArray.map(value => {
                  if (sortted == value.mtime) {
                    finalData.push(value);
                  }
                });
              });
              setData(finalData);
              tempData = [];
              finalData = [];
            } else {
              let tempData = [];
              gettedData.map(value => {
                tempData.push(value.mtime);
                tempData.sort(function (a, b) {
                  return b - a;
                });
              });
              let finalData = [];
              tempData.map(sortted => {
                gettedData.map(value => {
                  if (sortted == value.mtime) {
                    finalData.push(value);
                  }
                });
              });
              setData(finalData);
              tempData = [];
              finalData = [];
            }
          });
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onStartRecording = async () => {
    setIsRecording(true);
    const result = await audioRecorderPlayer.startRecorder(
      `/storage/emulated/0/Recording/Recording-${new Date().getTime()}.mp3`,
      {},
      true,
    );
    audioRecorderPlayer.addRecordBackListener(data => {
      setRecorderTime(data.currentPosition);
    });
    setRecordingPath(result);
  };

  const _onPauseResumeRecording = () => {
    if (recordingPause) {
      audioRecorderPlayer.pauseRecorder().then(() => {
        setRecordingPause(false);
      });
    } else {
      audioRecorderPlayer.resumeRecorder().then(() => {
        console.log('resumed');
        setRecordingPause(true);
      });
    }
  };

  const onStopRecording = () => {
    audioRecorderPlayer.resumeRecorder().then(() => {
      audioRecorderPlayer.stopRecorder().then(() => {
        setIsRecording(false);
        if (recorderTime <= 1100) {
          RNFS.unlink(recordingPath);
          ToastAndroid.show('Unable To Save', ToastAndroid.SHORT);
        }
        setRecorderTime(null);
        setRecordingPause(true);
        getFolderAudio();
      });
    });
  };
  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          !isRecording
            ? navigation.navigate('AudioPlayer', {
                item: JSON.stringify(item),
                index: JSON.stringify(index),
                itemArray: JSON.stringify(data),
              })
            : ToastAndroid.show('Recording is On', ToastAndroid.SHORT);
        }}
        style={{
          width: width,
          height: width / 5,
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{width: '90%'}}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: width / 18,
              color: '#EE4236',
              fontWeight: 'bold',
            }}>
            {item.fileName}
          </Text>
          <Text style={{color: 'black'}}>
            {moment(item.mtime).format('DD/MM/YYYY')}{' '}
            {moment(item.mtime).format('h:mm a')}
          </Text>
        </View>
        <TouchableOpacity
          style={{justifyContent: 'center'}}
          onPress={() => {
            Alert.alert(item.fileName, 'you want to delete?', [
              {text: 'CANCEL', onPress: () => {}},
              {
                text: 'OK',
                onPress: () => {
                  RNFS.unlink(item.path).then(() => {
                    getFolderAudio();
                  });
                },
              },
            ]);
          }}>
          <Image
            source={deleteIcon}
            style={{
              width: width / 15,
              height: width / 15,
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <LoaderView loaderTitle={'Loading'} isModalVisible={loaderVisible} />
      <View
        style={{
          flex: 1,
        }}>
        <StatusBar backgroundColor={'#EE4236'} />
        <View
          style={{
            flex: 0.5,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            elevation: 10,
            backgroundColor: '#EE4236',
          }}>
          <Text style={styles.timerText}>
            {recorderTime
              ? new Date(recorderTime).toISOString().slice(14, 19)
              : '00:00'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              width: width / 2,
            }}>
            {isRecording ? (
              <TouchableOpacity
                onPress={_onPauseResumeRecording}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image
                  source={recordingPause ? pauseIcon : playIcon}
                  style={{
                    width: width / 15,
                    height: width / 15,
                    tintColor: 'white',
                  }}
                />
                <Text style={{color: 'white'}}>
                  {recordingPause ? 'pause' : 'resume'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onStartRecording}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image
                  source={micIcon}
                  style={{
                    width: width / 15,
                    height: width / 15,
                    tintColor: 'white',
                  }}
                />
                <Text style={{color: 'white'}}>{'Start'}</Text>
              </TouchableOpacity>
            )}
            {isRecording && (
              <TouchableOpacity
                onPress={onStopRecording}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image
                  source={checkIcon}
                  style={{
                    width: width / 15,
                    height: width / 15,
                    tintColor: 'white',
                  }}
                />
                <Text style={{color: 'white'}}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {data.length !== 0 ? (
          <View style={{flex: 1, backgroundColor: 'white'}}>
            <FlatList
              data={data}
              extraData={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => String(index)}
              ItemSeparatorComponent={() => (
                <View
                  style={{width: width, height: 1, backgroundColor: 'gray'}}
                />
              )}
            />
          </View>
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 20}}>No Audio</Text>
          </View>
        )}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  timerText: {
    fontSize: width / 10,
    color: 'white',
  },
});

// import React from 'react';

// export default function AudioRecording(params) {
//   return null;
// }
