import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TransferScreen.tsx

const TransferScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Transfer Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TransferScreen;