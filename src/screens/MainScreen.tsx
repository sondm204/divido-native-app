import { StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { TouchableOpacity } from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import { AntDesign, Feather } from "@expo/vector-icons"; // Dọn dẹp import
import { Group } from "../store/slices/groupsSlice";
import GroupsListScreen from "./GroupListScreen";
import { BACKGROUND_COLOR, CARD_COLOR, TEXT_COLOR } from "../commons/constants";

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
export default function MainScreen() {
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
            <Feather name="plus" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>
    );

    const CurvedNavigator: any = CurvedBottomBar.Navigator;
    const CurvedScreen: any = CurvedBottomBar.Screen;

    return (
        <CurvedNavigator
            type="DOWN"
            bgColor={CARD_COLOR}
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
                        color={focused ? TEXT_COLOR : "#FFAAAA"}
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
                        color={focused ? TEXT_COLOR : "#FFAAAA"}
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
                        color={focused ? TEXT_COLOR : "#FFAAAA"}
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
                        color={focused ? TEXT_COLOR : "#FFAAAA"}
                    />
                )}
            />
        </CurvedNavigator>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: BACKGROUND_COLOR,
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
        color: TEXT_COLOR,
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