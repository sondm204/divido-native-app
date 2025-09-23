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
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgetPasswordScreen from "./src/screens/ForgetPasswordScreen";


import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            {/* ✅ AppWrapper ở TRONG NavigationContainer nên có thể dùng useNavigation */}
            <AppWrapper>
              <StatusBar style="dark" />
              <Stack.Navigator
                initialRouteName="GroupsList"
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#F7FAFF" },
                }}
              >
                <Stack.Screen name="GroupsList" component={GroupsListScreen} />
                <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
                <Stack.Screen name="GroupForm" component={GroupFormScreen} />
                <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
                <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgetPasswordScreen} />
              </Stack.Navigator>
            </AppWrapper>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GluestackUIProvider>
  );
}
