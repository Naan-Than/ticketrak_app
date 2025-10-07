import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import React from "react";

interface AppBarProps {
  title: string;
  onBackPress?: () => void;
  showBack?: boolean;
  hideBorder?: boolean;
  actions?: React.ReactNode;
}

const CustomAppBar: React.FC<AppBarProps> = ({
  title,
  onBackPress,
  showBack = true,
  hideBorder = false,
  actions,
}) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.appBar, { borderBottomWidth: hideBorder ? 0 : 1, }]}>
      <View style={styles.appBarContent}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
              if (onBackPress) {
                onBackPress();
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <Text style={styles.appBarTitle}>{title}</Text>

        <View style={styles.rightRow}>{actions}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    height: 55,
    backgroundColor: "#FFD700",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "#E5E7EB",
  },
  appBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  rightRow: {
    minWidth: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

export default CustomAppBar;
