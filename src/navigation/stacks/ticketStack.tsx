import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import TicketDetailScreen from '../../pages/home/TicketDetailScreen';
import TicketListScreen from '../../pages/home/TicketListScreen';

const ticketStack = createStackNavigator();
const TicketStack = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}
            edges={['left', 'right']}>
            <ticketStack.Navigator
                screenOptions={{
                    headerShown: false,
                    ...TransitionPresets.SlideFromRightIOS,
                }}
                initialRouteName='TicketListScreen' >
                <ticketStack.Screen
                    name="TicketListScreen"
                    component={TicketListScreen}
                />
                <ticketStack.Screen
                    name="TicketDetail"
                    component={TicketDetailScreen}
                />
            </ticketStack.Navigator>
        </SafeAreaView>
    );
};

export default TicketStack;