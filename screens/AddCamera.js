import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { Entypo, FontAwesome, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

const AddCamera = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [labels, setLabels] = useState([]);
  const [labelcolor, setLabelColor] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [highestLabel, setHighestLabel] = useState(null);
  const [highestColor, setHighestColor] = useState(null);

  const translateText = async (text) => {
    const apiKey = "AIzaSyDFiTfj2rYNjwypggKgtx46i9FZm2f7LwQ";
    const apiURL = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
      const response = await axios.post(apiURL, {
        q: text,
        target: 'th',
      });

      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการแปลภาษา:', error);
      return text; // ถ้าการแปลผิดพลาด, ส่งกลับคำเดิม
    }
  };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (labels.length > 0 || labelcolor.length > 0) {
      navigation.navigate('AddBlog', { imageUri: imageUri, labels: labels, labelcolor: labelcolor });
    }
  }, [labels, labelcolor]);

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        setImage(data.uri);
        setImageUri(data.uri);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImageUri(result.assets[0].uri);
        navigation.navigate('AddGallery', { imageUri: result.assets[0].uri });
      }
      console.log(result);
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const colorNameMapping = [
    { name: 'สีแดง', rgb: [255, 0, 0] },
    { name: 'สีน้ำเงิน', rgb: [0, 0, 255] },
    { name: 'สีน้ำเงิน', rgb: [0, 0, 139] },
    { name: 'สีน้ำเงิน', rgb: [173, 216, 230] },
    { name: 'สีเขียว', rgb: [0, 255, 0] },
    { name: 'สีเขียว', rgb: [0, 128, 0] },
    { name: 'สีเขียว', rgb: [144, 238, 144] },
    { name: 'สีเหลือง', rgb: [255, 255, 0] },
    { name: 'สีเหลือง', rgb: [255, 255, 224] },
    { name: 'สีเหลือง', rgb: [204, 204, 0] },
    { name: 'สีดำ', rgb: [0, 0, 0] },
    { name: 'สีขาว', rgb: [255, 255, 255] },
    { name: 'สีขาว', rgb: [245, 245, 245] },
    { name: 'สีม่วง', rgb: [128, 0, 128] },
    { name: 'สีม่วง', rgb: [216, 191, 216] },
    { name: 'สีม่วง', rgb: [75, 0, 130] },
    { name: 'สีชมพู', rgb: [255, 192, 203] },
    { name: 'สีชมพู', rgb: [255, 105, 180] },
    { name: 'สีส้ม', rgb: [255, 165, 0] },
    { name: 'สีส้ม', rgb: [255, 200, 0] },
    { name: 'สีส้ม', rgb: [255, 140, 0] },
    { name: 'สีเทา', rgb: [128, 128, 128] },
    { name: 'สีเทา', rgb: [211, 211, 211] },
    { name: 'สีเทา', rgb: [169, 169, 169] },
    { name: 'สีน้ำตาล', rgb: [165, 42, 42] },
    { name: 'สีน้ำตาล', rgb: [210, 105, 30] },
    { name: 'สีน้ำตาล', rgb: [101, 67, 33] },
    { name: 'สีม่วงแดง', rgb: [255, 0, 255] },
    { name: 'สีฟ้า', rgb: [0, 191, 255] },
    { name: 'สีฟ้า', rgb: [173, 216, 230] },
    { name: 'สีฟ้า', rgb: [0, 0, 139] }
  ];

  const findClosestColor = (r, g, b) => {
    // กำหนดค่าเริ่มต้นสำหรับสีที่ใกล้เคียงที่สุดและระยะทางขั้นต่ำ
    let closestColor = '';
    let minDistance = Infinity;

    // ตรวจสอบและปรับค่า r, g, b ให้อยู่ในช่วง 0 ถึง 255
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    colorNameMapping.forEach(color => {
      // ดึงค่า RGB ของสีจาก colorNameMapping
      const [cr, cg, cb] = color.rgb;

      // คำนวณระยะทางระหว่างสีที่ให้มา (r, g, b) กับสีใน colorNameMapping
      const distance = Math.sqrt(
        Math.pow(r - cr, 2) +
        Math.pow(g - cg, 2) +
        Math.pow(b - cb, 2)
      );

      // แสดงค่า distance
      console.log(`Distance to ${color.name}: ${distance}`);

      // หากระยะทางที่คำนวณได้ต่ำกว่าระยะทางขั้นต่ำที่บันทึกไว้
      if (distance < minDistance) {
        minDistance = distance; // อัปเดตระยะทางขั้นต่ำ
        closestColor = color.name;// อัปเดตชื่อสีที่ใกล้เคียงที่สุด
      }
    });

    // แสดงค่า minDistance หลังจากลูปเสร็จสิ้น
    console.log(`Minimum Distance: ${minDistance}`);
    return closestColor;
  };

  const targetLabels = [
    'bag', 'wallet', 'backpack', 'luggage', 'computer', 'electronic device',
    'mobile phone', 'headphones', 'keychain', 'key', 'gadget', 'mouse', 'chain'
  ];

  // const targetLabels = [
  //   'item', 'object', 'device', 'product', 'tool', 'Audio equipment'
  // ];

  const analyzeImage = async (imageUri) => {
    setLoading(true);
    try {
      if (!imageUri) {
        Alert.alert('เกิดข้อผิดพลาด', 'กรุณาเลือกภาพก่อน');
        setLoading(false);
        return;
      }

      const apiKey = "AIzaSyC_rS-8Yqz6Gd5bqx9EURKaY8x7E4puagw";
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (imageUri) {
        try {
          const requestData = {
            requests: [
              {
                image: {
                  content: base64ImageData,
                },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 20 },
                  { type: 'IMAGE_PROPERTIES', maxResults: 3 },
                  { type: 'SAFE_SEARCH_DETECTION' } // เพิ่ม SafeSearch Detection ที่นี่
                ],
              },
            ],
          };

          const apiResponse = await axios.post(apiURL, requestData);

          //ดึงข้อมูล labelAnnotations และ colorAnnotations ออกมาจากผลลัพธ์
          const labelAnnotations = apiResponse.data.responses[0].labelAnnotations || [];
          const colorAnnotations = apiResponse.data.responses[0].imagePropertiesAnnotation?.dominantColors?.colors || [];

          const getRiskDescriptionInThai = (riskLevel) => {
            const safeSearchLevels = {
              VERY_UNLIKELY: { text: 'แทบจะเป็นไปไม่ได้', percentage: 0 },
              UNLIKELY: { text: 'ไม่น่าจะเป็นไปได้', percentage: 25 },
              POSSIBLE: { text: 'เป็นไปได้', percentage: 50 },
              LIKELY: { text: 'น่าจะเป็นไปได้', percentage: 75 },
              VERY_LIKELY: { text: 'มีโอกาสสูง', percentage: 100 },
            };

            return safeSearchLevels[riskLevel] || { text: 'ไม่ทราบ', percentage: 0 };
          };

          const safeSearchAnnotations = apiResponse.data.responses[0].safeSearchAnnotation || {};

          const adultRisk = getRiskDescriptionInThai(safeSearchAnnotations.adult);
          const medicalRisk = getRiskDescriptionInThai(safeSearchAnnotations.medical);
          const violenceRisk = getRiskDescriptionInThai(safeSearchAnnotations.violence);
          const racyRisk = getRiskDescriptionInThai(safeSearchAnnotations.racy);
          const spoofRisk = getRiskDescriptionInThai(safeSearchAnnotations.spoof);

          // ตรวจสอบความเสี่ยง หาก 50% ขึ้นไป ให้แสดงแจ้งเตือนและหยุดกระบวนการไปหน้าถัดไป
          const risks = [adultRisk.percentage, medicalRisk.percentage, violenceRisk.percentage, racyRisk.percentage, spoofRisk.percentage];
          const isRisky = risks.some(risk => risk >= 50);
          // แสดงผล SafeSearch 
          console.log('ความล่อแหลมของภาพ:');
          console.log(`เนื้อหาผู้ใหญ่: ${adultRisk.text} (${adultRisk.percentage}%)`);
          console.log(`เนื้อหาทางการแพทย์: ${medicalRisk.text} (${medicalRisk.percentage}%)`);
          console.log(`ความรุนแรง: ${violenceRisk.text} (${violenceRisk.percentage}%)`);
          console.log(`เนื้อหาล่อแหลม: ${racyRisk.text} (${racyRisk.percentage}%)`);
          console.log(`เนื้อหาหลอกลวง: ${spoofRisk.text} (${spoofRisk.percentage}%)`);



          // แสดงผลลัพธ์ LABEL_DETECTION ที่แปลเป็นภาษาไทยพร้อมคะแนน
          console.log('LABEL_DETECTION Results:');
          for (const [index, label] of labelAnnotations.entries()) {
            const translatedDescription = await translateText(label.description);
            console.log(`${index + 1}. คำอธิบาย: ${translatedDescription}, คะแนน: ${label.score}`);
          }



          if (isRisky) {
            checkRiskAndAlert(adultRisk, medicalRisk, violenceRisk, racyRisk, spoofRisk);
          } else {
            // ถ้าไม่พบความเสี่ยง เก็บค่าผลลัพธ์เพื่อใช้ในหน้าถัดไป
            //กรอง Label ที่ตรงกับเป้าหมายที่กำหนดไว้
            const filteredLabels = labelAnnotations.filter(label => {
              const lowerCaseDescription = label.description.toLowerCase();
              return targetLabels.some(target => lowerCaseDescription.includes(target));
            });

            //แปลข้อความของ Label ที่กรองแล้ว
            const translatedLabelsPromises = filteredLabels.slice(0, 5).map(async (label) => ({
              ...label,
              description: await translateText(label.description),
            }));

            const translatedLabels = await Promise.all(translatedLabelsPromises);

            //ดึงสีที่เด่นออกมาจาก colorAnnotations
            const dominantColors = colorAnnotations.slice(0, 3).map(colorInfo => {
              const { red, green, blue } = colorInfo.color;
              const rgbRed = Math.round(red);
              const rgbGreen = Math.round(green);
              const rgbBlue = Math.round(blue);

              const colorName = findClosestColor(rgbRed, rgbGreen, rgbBlue);

              return {
                description: colorName,
                rgb: `rgb(${rgbRed}, ${rgbGreen}, ${rgbBlue})`,
                score: colorInfo.score
              };
            });

            //อัปเดตสถานะของ Labels และ Colors
            setLabels(translatedLabels);
            setLabelColor(dominantColors);

            //ค้นหาลูปที่มีคะแนนสูงสุด
            let highestLabel = translatedLabels.length > 0
              ? translatedLabels.reduce((max, label) => label.score > max.score ? label : max, { score: 0 })
              : null;

            const highestColor = dominantColors.length > 0
              ? dominantColors.reduce((max, color) => color.score > max.score ? color : max, { score: 0 })
              : null;

            // หากไม่พบ Label ที่สูงสุด ให้ตั้งค่าเป็น 'อื่นๆ'
            if (!highestLabel) {
              highestLabel = {
                description: 'อื่นๆ',
                score: 0
              };
            }

            console.log('Highest Label:', highestLabel);
            console.log('Highest Color:', highestColor);

            //อัปเดตสถานะของ Label ที่มีคะแนนสูงสุด และสีที่มีคะแนนสูงสุด
            setHighestLabel(highestLabel);
            setHighestColor(highestColor);
          }
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการวิเคราะห์ภาพ:', error);
          Alert.alert('เกิดข้อผิดพลาด', 'การวิเคราะห์ภาพล้มเหลว');
        }
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'การวิเคราะห์ภาพล้มเหลว');
    } finally {
      setLoading(false);
    }
  };



  const checkRiskAndAlert = (adultRisk, medicalRisk, violenceRisk, racyRisk, spoofRisk) => {
    const risks = [adultRisk.percentage, medicalRisk.percentage, violenceRisk.percentage, racyRisk.percentage, spoofRisk.percentage];

    // หากมีค่าเปอร์เซ็นต์ใดมากกว่า 50 ให้แจ้งเตือนและค้างหน้าภาพไว้
    if (risks.some(risk => risk >= 50)) {
      Alert.alert(
        'คำเตือน',
        'ภาพนี้มีเนื้อหาล่อแหลมหรือไม่เหมาะสม กรุณาลองใหม่อีกครั้ง',
        [
          {
            text: 'ถ่ายใหม่',
            onPress: () => {
              setImage(null); // รีเซ็ตภาพและเตรียมให้ผู้ใช้ถ่ายใหม่
              setImageUri(null);
              setLabels([]);
              setLabelColor([]);
              setLoading(false);
              navigation.navigate('AddCamera');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.overlayContainer}>
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.overlay}
            resizeMode="cover"
          >
            <View style={styles.overlayContent}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>กำลังประมวลผลรูปภาพ กรุณารอสักครู่</Text>
            </View>
          </ImageBackground>
        </View>
      ) : (
        <>
          {!image ? (
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
            />
          ) : (
            <Image source={{ uri: image }} style={styles.camera} />
          )}

          <View>
            {image ? (
              <View style={styles.after}>
                <TouchableOpacity
                  onPress={() => {
                    setImage(null);
                    setImageUri(null);
                    setLabels([]);
                    setLabelColor([]);
                    setLoading(false);
                  }}
                  style={styles.actionButton}
                >
                  <Entypo name="retweet" size={24} color="white" />
                  <Text style={styles.actionText}>ถ่ายใหม่</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => analyzeImage(image)}
                  style={styles.actionButton}
                >
                  <Entypo name="check" size={24} color="white" />
                  <Text style={styles.actionText}>บันทึก</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.controls}>
                <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                  <MaterialCommunityIcons name="camera-image" size={38} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={takePicture} style={styles.button}>
                  <FontAwesome name="circle" size={80} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleCameraFacing} style={styles.iconButton}>
                  <AntDesign name="retweet" size={35} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};


export default AddCamera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  camera: {
    flex: 1,
    borderRadius: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  iconButton: {
    marginTop: 20,
  },
  after: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  actionText: {
    color: 'white',
    marginTop: 5,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
  },
});