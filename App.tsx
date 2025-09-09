import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "./global.css"; // dùng cho NativeWind

import GroupsListScreen from "./src/screens/GroupListScreen";
import GroupDetailScreen from "./src/screens/GroupDetailScreen";
import AddGroupScreen from "./src/screens/AddGroupScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import ExpenseDetailScreen from "./src/screens/ExpenseDetailScreen";
import { Expense } from "./src/store/slices/expensesSlice";
import AppWrapper from "./src/components/AppWrapper";

// ---- Types ----
export type RootStackParamList = {
  GroupsList: undefined;
  GroupDetail: { groupId: string };
  AddGroup: undefined;
  AddExpense: { groupId: string };
  ExpenseDetail: { expenseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <AppWrapper>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
          initialRouteName="GroupsList"
          screenOptions={{ 
            headerShown: false,
            contentStyle: {
              backgroundColor: "#F7FAFF",
            },
          }}
          >
            <Stack.Screen
            name="GroupsList"
            component={GroupsListScreen}
            options={{ title: "Groups" }}
            />
            <Stack.Screen
            name="GroupDetail"
            component={GroupDetailScreen}
            options={{ title: "Group Detail", headerShown: false }}
            />
            <Stack.Screen
            name="AddGroup"
            component={AddGroupScreen}
            options={{ title: "Thêm nhóm" }}
            />
            <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{ title: "Thêm chi tiêu" }}
            />
            <Stack.Screen
            name="ExpenseDetail"
            component={ExpenseDetailScreen}
            options={{ title: "Chi tiêu" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppWrapper>
    </Provider>
  );
}
