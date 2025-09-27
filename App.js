import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [doorStatus, setDoorStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('192.168.1.100'); // Default IP
  const [authKey, setAuthKey] = useState('DoorLock2024!Secure#Key789'); // Updated auth key
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Auto-refresh status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && ipAddress && authKey) {
        checkDoorStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [ipAddress, authKey, loading]);

  // Initial status check
  useEffect(() => {
    if (ipAddress && authKey) {
      checkDoorStatus();
    }
  }, []);

  const makeRequest = async (endpoint) => {
    try {
      setLoading(true);
      const url = `http://${ipAddress}/${endpoint}?key=${encodeURIComponent(authKey)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid authentication key');
        } else if (response.status === 504) {
          throw new Error('No response from door controller');
        } else {
          throw new Error(`HTTP Error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('Network request failed')) {
        throw new Error(`Cannot connect to ${ipAddress}. Check if device is on the same WiFi network.`);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkDoorStatus = async () => {
    try {
      const data = await makeRequest('status');
      setDoorStatus(data.door);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Status check failed:', error.message);
      Alert.alert('Connection Error', error.message);
    }
  };

  const lockDoor = async () => {
    try {
      const data = await makeRequest('lock');
      setDoorStatus(data.door);
      setLastUpdate(new Date());
      Alert.alert('Success', 'Door locked successfully');
    } catch (error) {
      Alert.alert('Lock Error', error.message);
    }
  };

  const unlockDoor = async () => {
    try {
      const data = await makeRequest('unlock');
      setDoorStatus(data.door);
      setLastUpdate(new Date());
      Alert.alert('Success', 'Door unlocked successfully');
    } catch (error) {
      Alert.alert('Unlock Error', error.message);
    }
  };

  const saveConfig = () => {
    if (!ipAddress.trim()) {
      Alert.alert('Error', 'Please enter a valid IP address');
      return;
    }
    if (!authKey.trim()) {
      Alert.alert('Error', 'Please enter an authentication key');
      return;
    }
    setIsConfigVisible(false);
    checkDoorStatus();
  };

  const getDoorIcon = () => {
    switch (doorStatus) {
      case 'locked':
        return 'lock-closed';
      case 'unlocked':
        return 'lock-open';
      default:
        return 'help-circle';
    }
  };

  const getDoorColor = () => {
    switch (doorStatus) {
      case 'locked':
        return '#e74c3c';
      case 'unlocked':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Door Lock</Text>
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => setIsConfigVisible(!isConfigVisible)}
        >
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Configuration Panel */}
      {isConfigVisible && (
        <View style={styles.configPanel}>
          <Text style={styles.configTitle}>Device Configuration</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ESP8266 IP Address:</Text>
            <TextInput
              style={styles.input}
              value={ipAddress}
              onChangeText={setIpAddress}
              placeholder="192.168.1.100"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Authentication Key:</Text>
            <TextInput
              style={styles.input}
              value={authKey}
              onChangeText={setAuthKey}
              placeholder="DoorLock2024!Secure#Key789"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Door Status Display */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusCircle, { borderColor: getDoorColor() }]}>
            <Ionicons 
              name={getDoorIcon()} 
              size={80} 
              color={getDoorColor()} 
            />
          </View>
          
          <Text style={[styles.statusText, { color: getDoorColor() }]}>
            {doorStatus.charAt(0).toUpperCase() + doorStatus.slice(1)}
          </Text>
          
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.unlockButton]}
            onPress={unlockDoor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="lock-open" size={24} color="white" />
                <Text style={styles.buttonText}>Unlock</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.lockButton]}
            onPress={lockDoor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={24} color="white" />
                <Text style={styles.buttonText}>Lock</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={checkDoorStatus}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshText}>Check Status</Text>
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      <View style={styles.footer}>
        <Text style={styles.connectionText}>
          Connected to: {ipAddress}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  configButton: {
    padding: 8,
  },
  configPanel: {
    backgroundColor: 'white',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  statusCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  unlockButton: {
    backgroundColor: '#27ae60',
  },
  lockButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  refreshText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  footer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  connectionText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
