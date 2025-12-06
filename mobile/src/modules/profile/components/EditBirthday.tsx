import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';

interface EditBirthdayProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (date: string) => void;
  initialValue?: string;
}

const EditBirthday: React.FC<EditBirthdayProps> = ({
  visible,
  onClose,
  onSave,
  initialValue = '01/01/2000',
}) => {
  // Parse initialValue to get day, month, year
  const parseInitialValue = () => {
    if (
      !initialValue ||
      initialValue === '**/**/****' ||
      initialValue === '**/**/2004'
    ) {
      return {day: '01', month: 'Th1', year: '2000'};
    }
    const parts = initialValue.split('/');
    if (parts.length === 3) {
      let day = parts[0];
      let month = parts[1];
      let year = parts[2];

      // Convert numeric month to ThX format if needed
      if (month && !month.startsWith('Th')) {
        const monthNum = parseInt(month);
        if (monthNum >= 1 && monthNum <= 12) {
          month = `Th${monthNum}`;
        }
      }

      return {day, month, year};
    }
    return {day: '01', month: 'Th1', year: '2000'};
  };

  const initialDate = parseInitialValue();

  // Generate arrays first
  const days = Array.from({length: 31}, (_, i) =>
    String(i + 1).padStart(2, '0'),
  );

  const months = [
    'Th1',
    'Th2',
    'Th3',
    'Th4',
    'Th5',
    'Th6',
    'Th7',
    'Th8',
    'Th9',
    'Th10',
    'Th11',
    'Th12',
  ];

  const years = Array.from({length: 100}, (_, i) =>
    String(new Date().getFullYear() - 99 + i),
  );

  // Find indices for initial values
  const initialDayIndex = Math.max(0, days.indexOf(initialDate.day));
  const initialMonthIndex = Math.max(0, months.indexOf(initialDate.month));
  const initialYearIndex = Math.max(0, years.indexOf(initialDate.year));

  const [selectedDay, setSelectedDay] = useState(initialDate.day);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.month);
  const [selectedYear, setSelectedYear] = useState(initialDate.year);

  // Track middle item indices
  const [middleDayIndex, setMiddleDayIndex] = useState(initialDayIndex);
  const [middleMonthIndex, setMiddleMonthIndex] = useState(initialMonthIndex);
  const [middleYearIndex, setMiddleYearIndex] = useState(initialYearIndex);

  // Create refs for scroll views
  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Auto-scroll to initial position when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        dayScrollRef.current?.scrollTo({
          y: initialDayIndex * 40,
          animated: false,
        });
        monthScrollRef.current?.scrollTo({
          y: initialMonthIndex * 40,
          animated: false,
        });
        yearScrollRef.current?.scrollTo({
          y: initialYearIndex * 40,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialDayIndex, initialMonthIndex, initialYearIndex]);

  const handleSave = () => {
    const dateString = `${days[middleDayIndex]}/${months[middleMonthIndex]}/${years[middleYearIndex]}`;
    onSave?.(dateString);
    onClose();
  };

  const handleDayScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    // Calculate index: item height is 40, initial padding is 40
    // Middle position is at 40 (first item center after padding)
    const index = Math.round(yOffset / 40);
    setMiddleDayIndex(Math.max(0, Math.min(index, days.length - 1)));
  };

  const handleMonthScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / 40);
    setMiddleMonthIndex(Math.max(0, Math.min(index, months.length - 1)));
  };

  const handleYearScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / 40);
    setMiddleYearIndex(Math.max(0, Math.min(index, years.length - 1)));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.outsideArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Title */}
          <Text style={styles.title}>Chọn Ngày</Text>

          {/* Date Picker */}
          <View style={styles.pickerWrapper}>
            {/* Separator Lines */}
            <View style={styles.separatorContainer}>
              {/* Top separator - 3 segments */}
              <View style={styles.separatorTopRow}>
                <View style={styles.separatorSegment} />
                <View style={styles.separatorGap} />
                <View style={styles.separatorSegment} />
                <View style={styles.separatorGap} />
                <View style={styles.separatorSegment} />
              </View>
              {/* Bottom separator - 3 segments */}
              <View style={styles.separatorBottomRow}>
                <View style={styles.separatorSegment} />
                <View style={styles.separatorGap} />
                <View style={styles.separatorSegment} />
                <View style={styles.separatorGap} />
                <View style={styles.separatorSegment} />
              </View>
            </View>

            {/* ScrollViews */}
            <View style={styles.scrollContainer}>
              {/* Day Picker */}
              <View style={styles.scrollColumn}>
                <ScrollView
                  ref={dayScrollRef}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                  snapToInterval={40}
                  decelerationRate="fast"
                  contentContainerStyle={styles.scrollContent}
                  onScroll={handleDayScroll}>
                  {days.map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={styles.scrollItem}
                      onPress={() => setSelectedDay(day)}>
                      <Text
                        style={[
                          styles.scrollItemText,
                          index === middleDayIndex && styles.selectedText,
                        ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.scrollColumn}>
                <ScrollView
                  ref={monthScrollRef}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                  snapToInterval={40}
                  decelerationRate="fast"
                  contentContainerStyle={styles.scrollContent}
                  onScroll={handleMonthScroll}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={styles.scrollItem}
                      onPress={() => setSelectedMonth(month)}>
                      <Text
                        style={[
                          styles.scrollItemText,
                          index === middleMonthIndex && styles.selectedText,
                        ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.scrollColumn}>
                <ScrollView
                  ref={yearScrollRef}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                  snapToInterval={40}
                  decelerationRate="fast"
                  contentContainerStyle={styles.scrollContent}
                  onScroll={handleYearScroll}>
                  {years.map((year, index) => (
                    <TouchableOpacity
                      key={year}
                      style={styles.scrollItem}
                      onPress={() => setSelectedYear(year)}>
                      <Text
                        style={[
                          styles.scrollItemText,
                          index === middleYearIndex && styles.selectedText,
                        ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.buttonLeft}>
              <Text style={styles.cancelButton}>Hủy</Text>
            </TouchableOpacity>
            <View style={styles.buttonDivider} />
            <TouchableOpacity onPress={handleSave} style={styles.buttonRight}>
              <Text style={styles.confirmButton}>Hoàn thành</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  outsideArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 0,
    width: '75%',
    maxHeight: '70%',
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerWrapper: {
    marginBottom: 20,
    height: 120,
    position: 'relative',
  },
  separatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 2,
    pointerEvents: 'none',
  },
  separatorTopRow: {
    flexDirection: 'row',
    height: 2,
    marginTop: 39,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 0,
  },
  separatorBottomRow: {
    flexDirection: 'row',
    height: 2,
    marginTop: 39,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 0,
  },
  separatorSegment: {
    width: '25%',
    height: 2,
    backgroundColor: '#333333',
  },
  separatorGap: {
    width: 0,
  },
  scrollContainer: {
    flexDirection: 'row',
    height: 120,
    zIndex: 1,
    gap: 16,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  scrollColumn: {
    flex: 1,
    alignItems: 'center',
  },
  scrollItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#CCCCCC',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    height: 44,
  },
  buttonLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  buttonRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  buttonDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#E5E5EA',
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  },
  confirmButton: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FF4444',
  },
});

export default EditBirthday;
