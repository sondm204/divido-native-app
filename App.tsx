import React from "react";
import { StatusBar } from "expo-status-bar";
// ✅ Thêm useNavigation và các type cần thiết
import { useNavigation, NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

// --- Thư viện điều hướng và icon ---
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import { AntDesign, Feather } from "@expo/vector-icons"; // Dọn dẹp import

// --- Redux Store ---
import { store } from "./src/store/store";

// --- Import các màn hình thật của bạn ---
import GroupsListScreen from "./src/screens/GroupListScreen";
import GroupDetailScreen from "./src/screens/GroupDetailScreen";
import GroupFormScreen from "./src/screens/GroupFormScreen";
import ExpenseDetailScreen from "./src/screens/ExpenseDetailScreen";
import ExpenseFormScreen from "./src/screens/ExpenseFormScreen";
import { Group } from "./src/store/slices/groupsSlice";

// --- CSS toàn cục ---
import "./global.css";

// --- Định nghĩa Type cho Navigation ---
export type RootStackParamList = {
  Main: undefined;
  GroupDetail: { groupId: string };
  GroupForm: { type: "add" | "edit"; groupData: Group };
  ExpenseDetail: { expenseId: string };
  ExpenseForm: {
    mode: "create" | "edit";
    groupId?: string;
    expenseId?: string;
    initial?: any;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Màn hình Placeholder ---
const HomeScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Home Screen</Text>
  </View>
);
const DashboardScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Dashboard Screen</Text>
  </View>
);
const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Profile Screen</Text>
  </View>
);

// --- Component chứa thanh Tab chính ---
function MainTabs() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const _renderCircle = () => (
    <TouchableOpacity
      style={styles.fab}
      onPress={() =>
        navigation.navigate("GroupForm", {
          type: "add",
          groupData: {} as Group,
        })
      }
    >
      <Feather name="plus" size={24} color="white" />
    </TouchableOpacity>
  );

  const CurvedNavigator: any = CurvedBottomBar.Navigator;
  const CurvedScreen: any = CurvedBottomBar.Screen;

  return (
    <CurvedNavigator
      type="DOWN"
      bgColor="#FF4040"
      initialRouteName="Home"
      height={65}
      circleWidth={60}
      borderTopLeftRight={true}
      renderCircle={_renderCircle}
      screenOptions={{ headerShown: false }}
    >
      <CurvedScreen
        name="Home"
        position="LEFT"
        component={HomeScreen}
        icon={({ focused }: { focused: boolean }) => (
          <AntDesign
            name="home"
            size={24}
            color={focused ? "white" : "#FFAAAA"}
          />
        )}
      />
      <CurvedScreen
        name="Dashboard"
        position="LEFT"
        component={DashboardScreen}
        icon={({ focused }: { focused: boolean }) => (
          <AntDesign
            name="dashboard"
            size={24}
            color={focused ? "white" : "#FFAAAA"}
          />
        )}
      />
      <CurvedScreen
        name="GroupList"
        position="RIGHT"
        component={GroupsListScreen}
        icon={({ focused }: { focused: boolean }) => (
          <AntDesign
            name="team"
            size={24}
            color={focused ? "white" : "#FFAAAA"}
          />
        )}
      />
      <CurvedScreen
        name="Profile"
        position="RIGHT"
        component={ProfileScreen}
        icon={({ focused }: { focused: boolean }) => (
          <AntDesign
            name="user"
            size={24}
            color={focused ? "white" : "#FFAAAA"}
          />
        )}
      />
    </CurvedNavigator>
  );
}

// --- Component App chính ---
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#F7FAFF" },
            }}
          >
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
            <Stack.Screen name="GroupForm" component={GroupFormScreen} />
            <Stack.Screen
              name="ExpenseForm"
              component={ExpenseFormScreen as any}
            />
            <Stack.Screen
              name="ExpenseDetail"
              component={ExpenseDetailScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFF",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  fab: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF4040",
    bottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
