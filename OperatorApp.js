import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreenOperator from './screens/operator/LoginScreenOperator';
import DashboardOperator from './screens/operator/DashboardOperator';
import EmployeesOperator from './screens/operator/EmployeesOperator';
import AppointmentsOperator from './screens/operator/AppointmentsOperator';
import AppointmentDetailsOperatorScreen from './screens/operator/AppointmentDetailsOperatorScreen';
import NewEmployeeScreen from './screens/operator/NewEmployeeScreen';
import EmployeeDetailsScreen from './screens/operator/EmployeeDetailsScreen';
import EditEmployeeScreen from './screens/operator/EditEmployeeScreen';
import ProductsScreenOperator from './screens/operator/ProductsScreenOperator';
import NewProductScreenOperator from './screens/operator/NewProductScreenOperator';
import SpecificProductScreenOperator from './screens/operator/SpecificProductScreenOperator';
import EditProductScreenOperator from './screens/operator/EditProductScreenOperator';
import ServiceScreenOperator from './screens/operator/ServiceScreenOperator';
import NewServiceScreenOperator from './screens/operator/NewServiceScreenOperator';
import SpecificServiceScreenOperator from './screens/operator/SpecificServiceScreenOperator';
import EditServiceScreenOperator from './screens/operator/EditServiceScreenOperator';
import HaineScreenOperator from './screens/operator/HaineScreenOperator';
import NewHainaScreenOperator from './screens/operator/NewHainaScreenOperator';
import SpecificHainaScreenOperator from './screens/operator/SpecificHainaScreenOperator';
import EditHainaScreenOperator from './screens/operator/EditHainaScreenOperator';
import OrderScreenOperator from './screens/operator/OrderScreenOperator';
import NewOrderScreenOperator from './screens/operator/NewOrderScreenOperator';
import SpecificOrderScreenOperator from './screens/operator/SpecificOrderScreenOperator';
import EditOrderScreenOperator from './screens/operator/EditOrderScreenOperator';

const Stack = createStackNavigator();

const OperatorApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoginOperator">
        <Stack.Screen name="LoginOperator" component={LoginScreenOperator} />
        <Stack.Screen name="DashboardOperator" component={DashboardOperator} />
        <Stack.Screen name="EmployeesOperator" component={EmployeesOperator} />
        <Stack.Screen name="NewEmployeeScreen" component={NewEmployeeScreen} />
        <Stack.Screen name="EmployeeDetailsScreen" component={EmployeeDetailsScreen} />
        <Stack.Screen name="EditEmployeeScreen" component={EditEmployeeScreen} />
        <Stack.Screen name="AppointmentsOperator" component={AppointmentsOperator} />
        <Stack.Screen name="AppointmentDetailsOperator" component={AppointmentDetailsOperatorScreen} />
        <Stack.Screen name="ProductsScreenOperator" component={ProductsScreenOperator} />
        <Stack.Screen name="NewProductScreenOperator" component={NewProductScreenOperator} />
        <Stack.Screen name="SpecificProductScreenOperator" component={SpecificProductScreenOperator} />
        <Stack.Screen name="EditProductScreenOperator" component={EditProductScreenOperator} />
        <Stack.Screen name="ServiceScreenOperator" component={ServiceScreenOperator} />
        <Stack.Screen name="NewServiceScreenOperator" component={NewServiceScreenOperator} />
        <Stack.Screen name="SpecificServiceScreenOperator" component={SpecificServiceScreenOperator} />
        <Stack.Screen name="EditServiceScreenOperator" component={EditServiceScreenOperator} />
        <Stack.Screen name="HaineScreenOperator" component={HaineScreenOperator} />
        <Stack.Screen name="NewHainaScreenOperator" component={NewHainaScreenOperator} />
        <Stack.Screen name="SpecificHainaScreenOperator" component={SpecificHainaScreenOperator} />
        <Stack.Screen name="EditHainaScreenOperator" component={EditHainaScreenOperator} />
        <Stack.Screen name="OrderScreenOperator" component={OrderScreenOperator} />
        <Stack.Screen name="NewOrderScreenOperator" component={NewOrderScreenOperator} />
        <Stack.Screen name="SpecificOrderScreenOperator" component={SpecificOrderScreenOperator} />
        <Stack.Screen name="EditOrderScreenOperator" component={EditOrderScreenOperator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default OperatorApp; 