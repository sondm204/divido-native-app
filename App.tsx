import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

import GroupsListScreen from "./src/screens/GroupListScreen";
import GroupDetailScreen from "./src/screens/GroupDetailScreen";
import GroupFormScreen from "./src/screens/GroupFormScreen";
import ExpenseDetailScreen from "./src/screens/ExpenseDetailScreen";
import ExpenseFormScreen from "./src/screens/ExpenseFormScreen";

import { Provider } from "react-redux";
import { store } from "./src/store/store";
import AppWrapper from "./src/components/AppWrapper";
import { Group } from "./src/store/slices/groupsSlice";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ForgetPasswordScreen from "./src/screens/auth/ForgetPasswordScreen";


import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import VerifyCodeScreen from "./src/screens/auth/VerifyCodeScreen";
import EmailScreen from "./src/screens/auth/EmailScreen";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { View } from "react-native";

export type RootStackParamList = {
  GroupsList: undefined;
  GroupDetail: { groupId: string };
  GroupForm: { type: "add" | "edit"; groupData: Group };
  AddExpense: { groupId: string };
  ExpenseDetail: { expenseId: string };
  ExpenseForm: {
    mode: "create" | "edit";
    groupId: string;
    expenseId?: string;
    initial?: {
      categoryId: string;
      amount: number;
      payerId: string;
      spentAt: string; // yyyy-MM-dd
      note?: string;
      shareRatios: { userId: string; ratio: number }[];
    };
  };
  Login: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  Register: { email: string; verificationToken: string };
  Email: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <Provider store={store}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: "#2c333f" }}>
            <NavigationContainer>
              {/* ✅ AppWrapper ở TRONG NavigationContainer nên có thể dùng useNavigation */}
              <AppWrapper>
                <StatusBar style="dark" backgroundColor="#2c333f" />
                <Stack.Navigator
                  initialRouteName="Login"
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#2c333f" },
                  }}
                >
                  <Stack.Screen name="GroupsList" component={GroupsListScreen} 
                   options={{ navigationBarColor: "green", navigationBarHidden: false, }} />
                  <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
                  <Stack.Screen name="GroupForm" component={GroupFormScreen} />
                  <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
                  <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
                  <Stack.Screen name="Email" component={EmailScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="ForgotPassword" component={ForgetPasswordScreen} />
                </Stack.Navigator>
              </AppWrapper>
            </NavigationContainer>
          </View>
        </SafeAreaProvider>
      </Provider>
    </GluestackUIProvider>
  );
}
