import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  backArrowIcon,
  backwardIcon,
  forwardIcon,
  musicIcon,
  nextIcon,
  pauseIcon,
  playIcon,
  previousIcon,
} from '../Assests/Icon';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Slider from '@react-native-community/slider';
import moment from 'moment';
import TrackPlayer, {
  usePlaybackState,
  PlayerOptions,
  Event,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

const {width, height} = Dimensions.get('window');
export default function AudioPlayer({navigation, route}) {
  const AudioDataArray = JSON.parse(route.params?.itemArray);
  const [AudioData, setAudioData] = useState(JSON.parse(route.params?.item));
  const [AudioIndex, setAudioIndex] = useState(JSON.parse(route.params.index));
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(null);
  const progress = useProgress();
  useEffect(() => {
    if (!isSeeking && progress.position && progress.duration) {
      setSliderValue(progress.position / progress.duration);
    }
    if (
      progress.duration.toFixed(1) == progress.position.toFixed(1) &&
      progress.duration != 0
    ) {
      console.log('hello');
      console.log(AudioIndex);
      TrackPlayer.stop();
      AudioIndex + 1 < AudioDataArray.length
        ? (setAudioData(AudioDataArray[AudioIndex + 1]),
          setAudioIndex(AudioIndex + 1))
        : (setAudioData(AudioDataArray[0]), setAudioIndex(0));
      // navigation.goBack();
    }
  }, [progress]);
  useEffect(() => {
    setupPlayer();
    TrackPlayer.updateOptions({});
    navigation.addListener('beforeRemove', () => {
      onStopPlayer();
    });
    navigation.addListener('focus', () => {
      onStartPlayer();
    });
  }, []);
  useEffect(() => {
    setupPlayer();
  }, [AudioIndex]);

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer({});
    await TrackPlayer.updateOptions({
      stopWithApp: true,
    });
    await TrackPlayer.add({url: AudioDataArray[AudioIndex].path});
    TrackPlayer.play();
    setIsAudioPlaying(true);
  };
  const onClickPlayPause = async () => {
    setIsAudioPlaying(!isAudioPlaying);
    if (isAudioPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };
  const onStartPlayer = async () => {
    TrackPlayer.play();
  };
  const onStopPlayer = () => {
    TrackPlayer.stop();
  };
  return (
    <View style={{flex: 1}}>
      <View style={styles.headerStyle}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={backArrowIcon}
            style={{width: width / 15, height: width / 15}}
          />
        </TouchableOpacity>
        <View style={{width: '90%'}}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: width / 20,
              marginLeft: width / 20,
              color: 'white',
              fontWeight: 'bold',
            }}>
            {AudioData.fileName}
          </Text>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={musicIcon}
          style={{width: width / 2, height: width / 2}}
        />
      </View>
      <View>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
          }}>
          <Text
            style={{
              width: width / 10,
              textAlign: 'center',
              color: 'black',
            }}>
            {sliderValue
              ? new Date(sliderValue * progress.duration * 1000)
                  .toISOString()
                  .slice(14, 19)
              : '00:00'}
          </Text>
          <Slider
            style={{flex: 1}}
            thumbTintColor="#EE4236"
            minimumTrackTintColor="#EE4236"
            value={sliderValue}
            minimumValue={0}
            maximumValue={1}
            onSlidingStart={() => {
              setIsSeeking(true);
            }}
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value * progress.duration);
              setIsSeeking(false);
            }}
          />
          <Text
            style={{
              width: width / 10,
              textAlign: 'center',
              color: 'black',
            }}>
            {new Date(progress.duration * 1000).toISOString().slice(14, 19)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: width / 10,
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              TrackPlayer.stop();
              setAudioData(AudioDataArray[AudioIndex - 1]);
              setAudioIndex(AudioIndex - 1);
            }}>
            <Image
              source={previousIcon}
              style={{
                width: width / 15,
                height: width / 15,
                tintColor: '#EE4236',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              TrackPlayer.seekTo(progress.position - 10);
            }}>
            <Image
              source={backwardIcon}
              style={{
                width: width / 15,
                height: width / 15,
                tintColor: '#EE4236',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClickPlayPause}
            style={{alignItems: 'center'}}>
            <Image
              source={isAudioPlaying ? pauseIcon : playIcon}
              style={{
                width: width / 10,
                height: width / 10,
                tintColor: '#EE4236',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              TrackPlayer.seekTo(progress.position + 10);
            }}>
            <Image
              source={forwardIcon}
              style={{
                width: width / 15,
                height: width / 15,
                tintColor: '#EE4236',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              TrackPlayer.stop();
              AudioIndex + 1 < AudioDataArray.length
                ? (setAudioData(AudioDataArray[AudioIndex + 1]),
                  setAudioIndex(AudioIndex + 1))
                : (setAudioData(AudioDataArray[0]), setAudioIndex(0));
            }}>
            <Image
              source={nextIcon}
              style={{
                width: width / 15,
                height: width / 15,
                tintColor: '#EE4236',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  headerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EE4236',
    height: width / 6,
    padding: 10,
  },
});
