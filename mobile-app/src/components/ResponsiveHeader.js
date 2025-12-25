import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function ResponsiveHeader({
  title,
  onBackPress,
  rightComponent,
  rightIcon,
  onRightPress,
  backgroundColor = 'transparent',
  showBorder = true,
  centerTitle = true,
  showBackButton = true,
}) {
  const insets = useSafeAreaInsets();
  const { 
    getResponsiveValue, 
    getFontSize, 
    getContainerPadding,
    isAndroid,
    statusBarHeight
  } = useResponsive();

  // Calculate header height based on device
  const headerHeight = getResponsiveValue(56, 60, 64, 68, 72, 76, 80);
  const buttonSize = getResponsiveValue(40, 44, 48, 52, 56, 60, 64);
  const iconSize = getResponsiveValue(20, 22, 24, 26, 28, 30, 32);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        borderBottomWidth: showBorder ? 1 : 0,
        paddingTop: isAndroid ? statusBarHeight : insets.top,
      }
    ]}>
      {/* Status Bar for both platforms */}
      <StatusBar 
        backgroundColor={isAndroid ? (backgroundColor === 'transparent' ? Colors.crackzoneBlack : backgroundColor) : undefined}
        barStyle="light-content"
        translucent={isAndroid}
      />
      
      <View style={[
        styles.headerContent,
        {
          height: headerHeight,
          paddingHorizontal: getContainerPadding(),
        }
      ]}>
        {/* Left Button (Back) */}
        {showBackButton ? (
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              }
            ]}
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={iconSize} 
              color={Colors.text} 
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: buttonSize, height: buttonSize }} />
        )}

        {/* Title */}
        <View style={[
          styles.titleContainer,
          !centerTitle && styles.titleContainerLeft
        ]}>
          <Text 
            style={[
              styles.title,
              {
                fontSize: getFontSize(18),
                textAlign: centerTitle ? 'center' : 'left',
              }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>

        {/* Right Component */}
        <View style={[
          styles.rightContainer,
          {
            width: buttonSize,
            height: buttonSize,
          }
        ]}>
          {rightComponent ? (
            rightComponent
          ) : rightIcon ? (
            <TouchableOpacity
              style={[
                styles.headerButton,
                {
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: buttonSize / 2,
                }
              ]}
              onPress={onRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={rightIcon} 
                size={iconSize} 
                color={Colors.crackzoneYellow} 
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: Colors.border + '40',
    elevation: 2,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface + '60',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: Layout.spacing.md,
  },
  titleContainerLeft: {
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});