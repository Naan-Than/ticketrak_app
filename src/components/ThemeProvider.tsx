import React from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { ColorScheme, } from '../util/Theme';
import { Provider as PaperProvider } from 'react-native-paper';
import { useAppSelector } from '../store';

export default function ThemeProvider({ children }: any) {
    const color = useColorScheme();
    const theme = 'light';
    return <PaperProvider theme={ColorScheme(theme! || color! || 'light')}>
        <StatusBar backgroundColor={(theme == 'dark') ? 'black' : "white"} barStyle={(Platform.OS === 'android') ? (theme == 'dark' ? 'light-content' : 'dark-content') : (theme == 'dark' ? 'light-content' : 'dark-content')} />
        {children}
    </PaperProvider>
}