import { StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import GroupsListScreen from "./GroupListScreen";
import { BACKGROUND_COLOR, CARD_COLOR, TEXT_COLOR } from "../commons/constants";
import { ChartBar, House, Plus, UserRound, Wallet } from "lucide-react-native";
import { HomeScreen } from "./HomeScreen";
import AccountScreen from "./AccountScreen";

type RootStackParamList = {
    GroupForm: { type: string; groupData: object };
    Home: undefined;
    Dashboard: undefined;
    GroupList: undefined;
    Profile: undefined;
};

const DashboardScreen: React.FC = () => (
    <View style={styles.screen}>
        <Text style={styles.text} className="w-2/3 text-center">Chức năng đang trong quá trình phát triển!</Text>
    </View>
);

// --- Main Screen ---
export default function MainScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // 🟡 Nút tròn Floating Action Button
    const _renderCircle = () => (
        <TouchableOpacity
            style={styles.fab}
            onPress={() =>
                navigation.navigate("GroupForm", {
                    type: "add",
                    groupData: {},
                })
            }
        >
            <Plus size={24} color="#fff" />
        </TouchableOpacity>
    );

    // 🧩 Type của props renderIcon & tabBar
    type TabBarProps = {
        routeName: string;
        selectedTab: string;
        navigate: (name: string) => void;
    };

    // 🟢 Hàm render icon cho từng tab
    const _renderIcon = (routeName: string, selectedTab: string) => {
        const active = routeName === selectedTab;
        const color = active ? "#4f9cff" : "#9da7b6";

        switch (routeName) {
            case "Home":
                return <House size={24} color={color} />;
            case "Dashboard":
                return <ChartBar size={24} color={color} />;
            case "GroupList":
                return <Wallet size={24} color={color} />;
            case "Account":
                return <UserRound size={24} color={color} />;
            default:
                return null;
        }
    };

    // 🧭 Custom TabBar Item
    const _renderTabBar = ({ routeName, selectedTab, navigate }: TabBarProps) => (
        <TouchableOpacity
            onPress={() => navigate(routeName)}
            style={styles.tabbarItem}
        >
            {_renderIcon(routeName, selectedTab)}
        </TouchableOpacity>
    );

    const CurvedNavigator: any = CurvedBottomBar.Navigator;
    const CurvedScreen: any = CurvedBottomBar.Screen;

    return (
        <CurvedNavigator
            type="DOWN"
            bgColor="#2c333f"
            initialRouteName="Home"
            height={65}
            circleWidth={60}
            borderTopLeftRight={true}
            renderCircle={_renderCircle}
            tabBar={_renderTabBar} // ✅ chính xác để hiển thị icon
            screenOptions={{ headerShown: false }}
        >
            <CurvedScreen name="Home" position="LEFT" component={HomeScreen} />
            <CurvedScreen name="GroupList" position="LEFT" component={GroupsListScreen} />
            <CurvedScreen name="Dashboard" position="RIGHT" component={DashboardScreen} />
            <CurvedScreen name="Account" position="RIGHT" component={AccountScreen} />
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
    tabbarItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    fab: {
        justifyContent: "center",
        alignItems: "center",
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: CARD_COLOR,
        bottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});