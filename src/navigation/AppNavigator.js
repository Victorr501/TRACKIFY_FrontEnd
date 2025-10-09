import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import Registar from '../screens/RegistroScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
    return (
        <NavigationContainer >
            <Stack.Navigator
                screenOptions={{headerShown:false}}
            >
                <Stack.Screen name="Login" component={LoginScreen}/>
                <Stack.Screen name='Register' component={Registar}/>
            </Stack.Navigator>
        </NavigationContainer>
        
    )
}