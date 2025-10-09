import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

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
import MainScreen from "./src/screens/MainScreen";


import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import VerifyCodeScreen from "./src/screens/auth/VerifyCodeScreen";
import EmailScreen from "./src/screens/auth/EmailScreen";
import { View } from "react-native";
import { BACKGROUND_COLOR } from "./src/commons/constants";
import SurveyScreen from "./src/screens/SurveyScreen";

export type RootStackParamList = {
  SurveyScreen: undefined;
  MainScreen: undefined; // Add this for the bottom tab navigation
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
      imageUrl?: string;
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
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
          <NavigationContainer>
            {/* ✅ AppWrapper ở TRONG NavigationContainer nên có thể dùng useNavigation */}
            <AppWrapper>
              <StatusBar style="dark" backgroundColor={BACKGROUND_COLOR} />
              <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: BACKGROUND_COLOR },
                }}
              >
                {/* Main app with bottom tabs - shown after login */}
                <Stack.Screen name="SurveyScreen" component={SurveyScreen} />
                <Stack.Screen name="MainScreen" component={MainScreen} />

                {/* Individual screens that can be navigated to from tabs */}
                <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
                <Stack.Screen name="GroupForm" component={GroupFormScreen} />
                <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
                <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />

                {/* Auth screens */}
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
  );
}
