import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import EditProfile from '../components/EditProfile';
import EditImage from '../components/EditImage';
import EditGender from '../components/EditGender';
import EditBirthday from '../components/EditBirthday';

interface EditProfileScreenProps {
  navigation?: any;
}

interface UserInfo {
  name: string;
  title: string;
  gender: string;
  dob: string;
  personalInfo: string;
  phoneNumber: string;
  email: string;
  linkedAccounts: string;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({navigation}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Phạm Quý Đô',
    title: 'Thiết lập ngày',
    gender: 'Nam',
    dob: '**/**/2004',
    personalInfo: '',
    phoneNumber: '*********04',
    email: 'q***********@gmail.com',
    linkedAccounts: '',
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userInfo.name);
  const [editModalField, setEditModalField] = useState<keyof UserInfo | null>(
    null,
  );
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [showEditGenderModal, setShowEditGenderModal] = useState(false);
  const [showEditBirthdayModal, setShowEditBirthdayModal] = useState(false);

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleEditName = () => {
    setIsEditingName(!isEditingName);
    if (isEditingName) {
      setUserInfo({...userInfo, name: tempName});
    } else {
      setTempName(userInfo.name);
    }
  };

  const handleEditImage = () => {
    setShowEditImageModal(true);
  };

  const handleCameraPress = () => {
    console.log('Camera pressed');
    // TODO: Implement camera functionality
  };

  const handleGalleryPress = () => {
    console.log('Gallery pressed');
    // TODO: Implement gallery selection functionality
  };

  const handleEditField = (field: keyof UserInfo) => {
    // Only name and title use EditProfile component
    // Other fields will use separate components to be designed later
    if (field === 'name' || field === 'title') {
      setEditModalField(field);
    } else if (field === 'gender') {
      setShowEditGenderModal(true);
    } else if (field === 'dob') {
      setShowEditBirthdayModal(true);
    } else {
      // TODO: Handle other fields with separate components
      console.log('Edit field:', field);
    }
  };

  const handleSaveField = (value: string) => {
    if (editModalField) {
      setUserInfo({...userInfo, [editModalField]: value});
    }
  };

  const handleSaveGender = (gender: string) => {
    setUserInfo({...userInfo, gender});
  };

  const handleSaveBirthday = (date: string) => {
    setUserInfo({...userInfo, dob: date});
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
            {value}
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
              <Image
                source={require('../../../assets/icons/UserIcon.png')}
                style={styles.avatarImage}
              />
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditImage}>
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
          {renderProfileInfoRow('Tiêu sứ', userInfo.title, 'title')}
          {renderProfileInfoRow('Giới tính', userInfo.gender, 'gender', true)}
          {renderProfileInfoRow('Ngày sinh', userInfo.dob, 'dob', true)}
          {renderProfileInfoRow(
            'Thông tin cá nhân',
            userInfo.personalInfo || 'Chưa cập nhật',
            'personalInfo',
            true,
          )}
          {renderProfileInfoRow(
            'Số điện thoại',
            userInfo.phoneNumber,
            'phoneNumber',
            true,
          )}
          {renderProfileInfoRow('Email', userInfo.email, 'email', true, false)}
          {renderProfileInfoRow(
            'Tài khoản liên kết',
            userInfo.linkedAccounts || 'Chưa liên kết',
            'linkedAccounts',
            true,
          )}
        </View>

        {/* Edit Component for Name and Title */}
        {editModalField && (
          <EditProfile
            visible={editModalField === 'name' || editModalField === 'title'}
            title={`Sửa ${editModalField === 'name' ? 'tên' : 'tiêu sứ'}`}
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
              : editModalField === 'title'
              ? 'tiêu sứ'
              : editModalField === 'gender'
              ? 'giới tính'
              : editModalField === 'dob'
              ? 'ngày sinh'
              : editModalField === 'personalInfo'
              ? 'thông tin cá nhân'
              : editModalField === 'phoneNumber'
              ? 'số điện thoại'
              : editModalField === 'email'
              ? 'email'
              : 'tài khoản liên kết'
          }`}
          initialValue={userInfo[editModalField] || ''}
          onClose={() => setEditModalField(null)}
          onSave={handleSaveField}
        />
      )}

      {/* Edit Image Modal */}
      <EditImage
        visible={showEditImageModal}
        onClose={() => setShowEditImageModal(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />

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
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  editAvatarIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
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
  displayNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  nameEditSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  nameInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#0078D4',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    paddingVertical: 8,
    marginBottom: 12,
  },
  nameSaveButton: {
    backgroundColor: '#0078D4',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  nameSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  nameSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
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
});

export default EditProfileScreen;
