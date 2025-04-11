import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { TouchableOpacity, StyleSheet, View, Text, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeProvider';
import HomeScreen from '../screens/HomeScreen';
import AddEntryScreen from '../screens/AddEntryScreen';

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// New color scheme - Earthy tones with teal accent
const createCustomTheme = (baseTheme: typeof DefaultTheme, isDark: boolean) => {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: isDark ? '#2DD4BF' : '#0D9488', // Teal
      background: isDark ? '#1E293B' : '#F8FAFC', // Dark slate / Light gray
      card: isDark ? '#334155' : '#FFFFFF',
      text: isDark ? '#E2E8F0' : '#1E293B',
      border: isDark ? '#475569' : '#E2E8F0',
      notification: isDark ? '#F87171' : '#EF4444',
    },
  };
};

const AppNavigator = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const customLightTheme = createCustomTheme(DefaultTheme, false);
  const customDarkTheme = createCustomTheme(DarkTheme, true);

  // Logo component
  const LogoTitle = () => (
    <View style={styles.logoContainer}>
      <Image 
        source={require('./wonderlog-logo.png')} 
        style={styles.logo} 
      />
      <Text style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
        WanderLog
      </Text>
    </View>
  );

  return (
    <NavigationContainer theme={isDark ? customDarkTheme : customLightTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#334155' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            shadowColor: '#000',
            borderBottomWidth: 0,
          },
          headerTintColor: isDark ? '#E2E8F0' : '#1E293B',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 20,
          },
          cardStyle: {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
          },
          headerBackTitleVisible: false,
          headerLeftContainerStyle: {
            paddingLeft: 8,
          },
          headerRightContainerStyle: {
            paddingRight: 8,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerTitle: () => <LogoTitle />,
            headerTitleAlign: 'left',
            headerLeft: () => null,
            headerRight: () => (
              <View style={styles.headerRightContainer}>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={[styles.themeButton, { 
                    backgroundColor: isDark ? 'rgba(45, 212, 191, 0.1)' : 'rgba(13, 148, 136, 0.1)' 
                  }]}
                >
                  <Feather 
                    name={isDark ? 'sun' : 'moon'} 
                    size={22} 
                    color={isDark ? '#2DD4BF' : '#0D9488'} 
                  />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="AddEntry"
          component={AddEntryScreen}
          options={({ navigation }) => ({
            title: 'New Journey',
            headerTitleAlign: 'center',
            headerRight: () => null,
            headerTintColor: isDark ? '#2DD4BF' : '#0D9488',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Platform.OS === 'ios' ? -10 : 0,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerBackText: {
    fontSize: 16,
    marginLeft: Platform.OS === 'ios' ? 4 : 0,
    display: Platform.OS === 'ios' ? 'flex' : 'none',
    fontWeight: '600',
  },
});

export default AppNavigator;