import React from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";

const PrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Privacy Policy</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>
          Welcome to our Privacy Policy page. Your privacy is critically
          important to us. This policy explains how we collect, use, and share
          your information when you use our app.
        </Text>
        <Text style={styles.text}>
          We collect personal information such as your name, email address, and
          other details you provide when signing up. This information is used
          to provide and improve our services.
        </Text>
        <Text style={styles.text}>
          We do not share your personal information with third parties except
          as necessary to provide our services or as required by law.
        </Text>
        <Text style={styles.text}>
          By using our app, you agree to the terms of this Privacy Policy. If
          you have any questions, please contact us.
        </Text>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Back to Profile" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default PrivacyScreen;