import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface PickerItem {
  label: string;
  value: any;
}

interface PickerProps {
  selectedValue: any;
  onValueChange: (value: any) => void;
  children: React.ReactElement<PickerItemProps>[];
  style?: any;
}

interface PickerItemProps {
  label: string;
  value: any;
}

export function PickerItem({ label, value }: PickerItemProps) {
  // This component is just for type checking, actual rendering is handled by Picker
  return null;
}

export function Picker({ selectedValue, onValueChange, children, style }: PickerProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Extract items from children
  const items: PickerItem[] = React.Children.map(children, (child) => ({
    label: child.props.label,
    value: child.props.value,
  })) || [];
  
  const selectedItem = items.find(item => item.value === selectedValue);
  
  const handleSelect = (value: any) => {
    onValueChange(value);
    setModalVisible(false);
  };
  
  const renderItem = ({ item }: { item: PickerItem }) => (
    <TouchableOpacity
      style={[styles.modalItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Check size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={style}>
      <TouchableOpacity
        style={[styles.picker, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, { color: theme.colors.text }]}>
          {selectedItem?.label || 'Select an option'}
        </Text>
        <ChevronDown size={20} color={theme.colors.secondary} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Option</Text>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.value)}
              style={styles.modalList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Export as default object to match @react-native-picker/picker API
const PickerComponents = {
  Picker,
  Item: PickerItem,
};

export default PickerComponents;

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
});