import React, {useState} from 'react';
import {View, Text, StyleSheet, StatusBar, SafeAreaView} from 'react-native';
import TabBar from '../../../shared/Components/TabBar';

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    // TODO: Navigate to respective screens based on tabId
    console.log('Tab pressed:', tabId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Home</Text>
        <Text style={styles.subtitle}>You have successfully logged in!</Text>
        <Text style={styles.activeTabText}>Current Tab: {activeTab}</Text>
      </View>
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  activeTabText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;
