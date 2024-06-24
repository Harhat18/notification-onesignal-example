import {Alert, Button, StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
    Alert.alert('Detail', remoteMessage.notification.title);
  });

  const handleBackgroundNoti = () => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
        );
        Alert.alert('Detail', remoteMessage.notification.title);
      });
  };

  useEffect(() => {
    const initializeNotifee = async () => {
      const token = await messaging().getToken();
      console.log('token', token);

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        sound: 'default',
        importance: AndroidImportance.HIGH,
      });
      console.log('channelId', channelId);

      const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
        switch (type) {
          case EventType.DISMISSED:
            console.log('User dismissed notification', detail.notification);
            break;
          case EventType.PRESS:
            console.log('User pressed notification', detail.notification);
            Alert.alert('Detail', detail.notification.title);
            break;
        }
      });

      return unsubscribe;
    };

    const unsubscribe = initializeNotifee();
    return () => unsubscribe;
  }, []);

  const onDisplayNotification = async (title, body) => {
    await notifee.requestPermission();

    await notifee.displayNotification({
      title: title,
      body: body,
      sound: 'default',
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  messaging().onMessage(async remoteMessage => {
    console.log('remote msj', remoteMessage);
    await onDisplayNotification(
      remoteMessage?.notification?.title,
      remoteMessage?.notification?.body,
    );
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('remote msj', remoteMessage);
    await onDisplayNotification(
      remoteMessage?.notification?.title,
      remoteMessage?.notification?.body,
    );
  });

  return (
    <View style={styles.container}>
      <Button
        title="Display Notification"
        onPress={() =>
          onDisplayNotification('local notification', 'local notification body')
        }
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
