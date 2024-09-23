import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

Geocoder.init('AIzaSyBEc2JPHCt-egl-kA5ndE9TZbof7_CP-u4');

const Map = ({ route }) => {
  const navigation = useNavigation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('การอนุญาตให้เข้าถึงตำแหน่งถูกปฏิเสธ');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      console.log('สถานที่ปัจจุบัน:', location.coords);
    };

    getCurrentLocation();
  }, []);

  const handleSelectLocation = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    try {
      const response = await Geocoder.from(latitude, longitude); //แปลงพิกัดเป็นที่อยู่
      const address = response.results[0].formatted_address;
      setSelectedAddress(address);
      console.log('ตำแหน่งที่เลือก:', { latitude, longitude });
      console.log('ที่อยู่:', address);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเรียกที่อยู่:", error);
    }
  };

  const handleConfirmLocation = () => {
    route.params.onLocationSelect(selectedAddress);
    navigation.goBack();
  };

  // กำหนดขอบเขตของแผนที่
  const region = selectedLocation ? {
    //พิกัด ละติจูด ลองจิจูด ของตำแหน่งที่เลือก
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    //ขนาดของการซูมบนแผนที่
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : currentLocation ? {
    latitude: currentLocation.latitude, //พิกัดของตำแหน่งปัจจุบัน
    longitude: currentLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : undefined;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleSelectLocation}
        region={region}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} />
        )}
        {currentLocation && (
          <Marker coordinate={currentLocation} pinColor="blue" />
        )}
      </MapView>
      {selectedAddress && (
        <View style={styles.addressContainer}>
          <Text>{selectedAddress}</Text>
          <TouchableOpacity onPress={handleConfirmLocation} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>ยืนยันตำแหน่ง</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: '#006FFD',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});