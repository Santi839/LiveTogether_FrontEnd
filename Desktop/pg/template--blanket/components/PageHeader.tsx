import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface PageHeaderProps {
    title: string;
}

const ACCENT_COLOR = '#6A87D8';
const MAIN_COLOR = '#001F3F';

export default function PageHeader({ title }: PageHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <FontAwesome5 name="house-user" size={24} color={MAIN_COLOR} />
                <Text style={styles.logoText}>LIFETOGETHER</Text>
            </View>
            <Image
                source={require('../assets/images/PROFILE_IMAGE.png')}
                style={styles.profileImage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: 'white',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 22,
        fontFamily: 'Raleway-Bold',
        color: MAIN_COLOR,
        marginLeft: 8,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: ACCENT_COLOR,
    },
});
