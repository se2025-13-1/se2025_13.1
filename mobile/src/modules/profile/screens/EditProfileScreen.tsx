import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import EditProfile from '../components/EditProfile';
import EditGender from '../components/EditGender';
import EditBirthday from '../components/EditBirthday';
import {useAuth} from '../../../contexts/AuthContext';
import {ProfileApi} from '../services/profileApi';
import {AuthApi} from '../../auth/services/authApi';

interface EditProfileScreenProps {
  navigation?: any;
}

interface UserInfo {
  name: string;
  gender: string;
  dob: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({navigation}) => {
  const {user, refreshUser} = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    gender: '',
    dob: '',
    phoneNumber: '',
    email: '',
    avatarUrl: '',
  });

  const [editModalField, setEditModalField] = useState<keyof UserInfo | null>(
    null,
  );
  const [showEditGenderModal, setShowEditGenderModal] = useState(false);
  const [showEditBirthdayModal, setShowEditBirthdayModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load full profile data from backend
  const loadProfileData = async () => {
    try {
      const response = await AuthApi.getProfile();

      if (response && response.user) {
        const userData = response.user;

        // Map gender from backend format to Vietnamese
        let genderDisplay = '';
        if (userData.gender === 'male') genderDisplay = 'Nam';
        else if (userData.gender === 'female') genderDisplay = 'Nữ';
        else if (userData.gender === 'other') genderDisplay = 'Khác';

        // Format birthday from YYYY-MM-DD or ISO datetime to DD/ThX/YYYY for display
        let dobDisplay = '';
        if (userData.birthday) {
          // Extract date part if it's ISO datetime format (YYYY-MM-DDTHH:MM:SS.sssZ)
          let dateOnly = userData.birthday;
          if (dateOnly.includes('T')) {
            dateOnly = dateOnly.split('T')[0];
          }

          const dateParts = dateOnly.split('-');
          if (dateParts.length === 3) {
            const year = dateParts[0];
            const month = `Th${parseInt(dateParts[1])}`;
            const day = dateParts[2];
            dobDisplay = `${day}/${month}/${year}`;
          }
        }

        setUserInfo({
          name: userData.full_name || userData.fullName || '',
          gender: genderDisplay,
          dob: dobDisplay,
          phoneNumber: userData.phone || '',
          email: userData.email || '',
          avatarUrl: userData.avatar_url || userData.avatarUrl || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Fallback to user from AuthContext
      if (user) {
        setUserInfo({
          name: user.fullName || '',
          gender: '',
          dob: '',
          phoneNumber: '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
        });
      }
    }
  };

  // Load user data from backend on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const handleBackPress = () => {
    navigation?.goBack();
  };

  // Request camera permission for Android
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Quyền sử dụng Camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting camera permission:', err);
      return false;
    }
  };

  // Handle image picker response
  const handleImagePickerResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Lỗi', response.errorMessage || 'Không thể chọn ảnh');
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        await uploadImageToBackend(imageUri);
      }
    }
  };

  // Upload image to backend
  const uploadImageToBackend = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);

      // Upload image and get URL
      const imageUrl = await ProfileApi.uploadImage(imageUri);

      // Update profile with new avatar URL
      await ProfileApi.updateProfile({avatar_url: imageUrl});

      // Reload profile data from backend
      await loadProfileData();

      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditImage = () => {
    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {text: 'Hủy', style: 'cancel'},
        {text: 'Thư viện', onPress: openImageLibrary},
        {text: 'Camera', onPress: openCamera},
      ],
      {cancelable: true},
    );
  };

  const openImageLibrary = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 1,
    };

    launchImageLibrary(options, handleImagePickerResponse);
  };

  const openCamera = async () => {
    // Request camera permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Quyền bị từ chối',
        'Vui lòng cấp quyền camera trong cài đặt để sử dụng tính năng này',
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
      cameraType: 'back',
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const handleEditField = (field: keyof UserInfo) => {
    if (field === 'name' || field === 'phoneNumber') {
      setEditModalField(field);
    } else if (field === 'gender') {
      setShowEditGenderModal(true);
    } else if (field === 'dob') {
      setShowEditBirthdayModal(true);
    } else {
      console.log('Edit field:', field);
    }
  };

  const handleSaveField = async (value: string) => {
    if (editModalField === 'name') {
      try {
        setIsLoading(true);

        // Update profile on backend
        await ProfileApi.updateProfile({full_name: value});

        // Reload profile data from backend
        await loadProfileData();

        Alert.alert('Thành công', 'Cập nhật tên thành công');
        setEditModalField(null);
      } catch (error: any) {
        console.error('Failed to update name:', error);
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật tên');
      } finally {
        setIsLoading(false);
      }
    } else if (editModalField === 'phoneNumber') {
      try {
        setIsLoading(true);

        // Update profile on backend
        await ProfileApi.updateProfile({phone: value});

        // Reload profile data from backend
        await loadProfileData();

        Alert.alert('Thành công', 'Cập nhật số điện thoại thành công');
        setEditModalField(null);
      } catch (error: any) {
        console.error('Failed to update phone:', error);
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật số điện thoại');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveGender = async (gender: string) => {
    try {
      setIsLoading(true);

      // Map Vietnamese gender to backend format
      let genderValue = 'other';
      if (gender === 'Nam') genderValue = 'male';
      else if (gender === 'Nữ') genderValue = 'female';

      // Update profile on backend
      await ProfileApi.updateProfile({gender: genderValue});

      // Reload profile data from backend
      await loadProfileData();

      Alert.alert('Thành công', 'Cập nhật giới tính thành công');
      setShowEditGenderModal(false);
    } catch (error: any) {
      console.error('Failed to update gender:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật giới tính');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBirthday = async (date: string) => {
    try {
      setIsLoading(true);

      // Convert date format from DD/ThX/YYYY to YYYY-MM-DD
      let formattedDate = date;
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          let day = parts[0];
          let month = parts[1];
          let year = parts[2];

          // Convert ThX format to numeric month (Th1 -> 01, Th2 -> 02, etc.)
          if (month.startsWith('Th')) {
            const monthNum = month.substring(2); // Remove 'Th' prefix
            month = monthNum.padStart(2, '0'); // Pad with zero if needed
          } else {
            // If already numeric, just pad
            month = month.padStart(2, '0');
          }

          // Pad day with zero if needed
          day = day.padStart(2, '0');

          formattedDate = `${year}-${month}-${day}`;
        }
      }

      // Update profile on backend
      await ProfileApi.updateProfile({birthday: formattedDate});

      // Reload profile data from backend
      await loadProfileData();

      Alert.alert('Thành công', 'Cập nhật ngày sinh thành công');
      setShowEditBirthdayModal(false);
    } catch (error: any) {
      console.error('Failed to update birthday:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật ngày sinh');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileInfoRow = (
    label: string,
    value: string,
    fieldKey: keyof UserInfo,
    isEditable: boolean = true,
    isVerified: boolean = false,
  ) => {
    const isSet =
      value &&
      value !== 'Thiết lập ngày' &&
      value !== 'Chưa cập nhật' &&
      value !== 'Chưa liên kết';

    return (
      <TouchableOpacity
        style={styles.infoRow}
        onPress={() => isEditable && handleEditField(fieldKey)}
        activeOpacity={isEditable ? 0.7 : 1}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>{label}</Text>
          {isVerified && <Text style={styles.infoIcon}>ℹ️</Text>}
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={[styles.infoValue, !isSet && styles.infoValueUnset]}>
            {value || 'Chưa cập nhật'}
          </Text>
          <Image
            source={require('../../../assets/icons/ArrowForward.png')}
            style={styles.infoArrow}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa hồ sơ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Avatar Section with Edit Button */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {userInfo.avatarUrl ? (
                <Image
                  source={{uri: userInfo.avatarUrl}}
                  style={styles.avatarImageFull}
                />
              ) : (
                <Image
                  source={require('../../../assets/icons/UserIcon.png')}
                  style={styles.avatarImage}
                />
              )}
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditImage}
            disabled={isUploadingImage}>
            <Image
              source={require('../../../assets/icons/Edit.png')}
              style={styles.editButtonIcon}
            />
            <Text style={styles.editButtonText}>Sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Name Input Row */}
        <View style={styles.infoSection}>
          {renderProfileInfoRow('Tên', userInfo.name, 'name', true, false)}

          {/* Profile Info Section */}
          {renderProfileInfoRow('Giới tính', userInfo.gender, 'gender', true)}
          {renderProfileInfoRow('Ngày sinh', userInfo.dob, 'dob', true)}
          {renderProfileInfoRow(
            'Số điện thoại',
            userInfo.phoneNumber,
            'phoneNumber',
            true,
          )}
          {renderProfileInfoRow('Email', userInfo.email, 'email', false, false)}
        </View>

        {/* Edit Component for Name */}
        {editModalField && (
          <EditProfile
            visible={
              editModalField === 'name' || editModalField === 'phoneNumber'
            }
            title={`Sửa ${editModalField === 'name' ? 'tên' : 'số điện thoại'}`}
            initialValue={userInfo[editModalField] || ''}
            onClose={() => setEditModalField(null)}
            onSave={handleSaveField}
          />
        )}
      </ScrollView>

      {/* Edit Modal */}
      {editModalField && (
        <EditProfile
          visible={!!editModalField}
          title={`Sửa ${
            editModalField === 'name'
              ? 'tên'
              : editModalField === 'gender'
              ? 'giới tính'
              : editModalField === 'dob'
              ? 'ngày sinh'
              : editModalField === 'phoneNumber'
              ? 'số điện thoại'
              : 'email'
          }`}
          initialValue={userInfo[editModalField] || ''}
          onClose={() => setEditModalField(null)}
          onSave={handleSaveField}
        />
      )}

      {/* Edit Gender Modal */}
      <EditGender
        visible={showEditGenderModal}
        onClose={() => setShowEditGenderModal(false)}
        onSave={handleSaveGender}
        initialValue={userInfo.gender}
      />

      {/* Edit Birthday Modal */}
      <EditBirthday
        visible={showEditBirthdayModal}
        onClose={() => setShowEditBirthdayModal(false)}
        onSave={handleSaveBirthday}
        initialValue={userInfo.dob}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0078D4" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
  },
  headerSpacer: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  avatarImageFull: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
  },
  editButtonIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
    marginRight: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginLeft: 4,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    marginRight: 8,
  },
  infoValueUnset: {
    fontWeight: '400',
    color: '#AAAAAA',
  },
  infoArrow: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#CCCCCC',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditProfileScreen;
