import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { Home } from '../screens/Home';
import { Preview } from '../screens/Preview';
import { Output } from '../screens/Output';

const MainStack = createStackNavigator();

export const Main = () => (
  <MainStack.Navigator>
    <MainStack.Screen
      name="Home"
      options={{
        headerTitle: 'AutoEnhancer',
        headerTitleStyle: {
          color: '#F4717F',
        },
      }}
      component={Home}
    />
    <MainStack.Screen
      name="Preview"
      component={Preview}
      options={{
        headerTitle: 'Preview',
        headerTitleStyle: {
          color: '#F4717F',
        },
      }}
    />
    <MainStack.Screen
      name="Output"
      component={Output}
      options={{
        headerTitle: 'Output',
        headerTitleStyle: {
          color: '#F4717F',
        },
      }}
    />
  </MainStack.Navigator>
);
