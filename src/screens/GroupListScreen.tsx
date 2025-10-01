import React, { useEffect } from "react";
import {
    FlatList,
    TouchableOpacity,
    Text,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { deleteGroup, fetchGroups, Group, setSelectedGroupId } from "../store/slices/groupsSlice";
import { AppDispatch, RootState } from "../store/store";
import LoadingOverlay from "../components/LoadingOverlay";
import { Trash2, Trash } from "lucide-react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mixpanel } from "../utils/mixpanel";


// ---- Types ----
type RootStackParamList = {
    GroupsList: undefined;
    GroupDetail: { groupId: string };
    GroupForm: { type: 'add' | 'edit', groupData: Group };
};

export default function GroupsListScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const dispatch = useDispatch<AppDispatch>();
    const groups = useSelector((state: RootState) => state.groups.groups);
    const loading = useSelector((state: RootState) => state.groups.loading);

    useEffect(() => {
        Mixpanel.trackScreenView("GroupsList");
        Mixpanel.timeEvent("Fetch Groups Duration");
        dispatch(fetchGroups());
    }, [dispatch]);

    function handleDelete(groupId: string) {
        Mixpanel.track("Group Delete Click", { group_id: groupId });
        dispatch(deleteGroup(groupId));
    }

    function renderItem({ item }: { item: Group }) {
        return (
            <TouchableOpacity
                onPress={() => {
                    Mixpanel.track("Group Item Click", { group_id: item.id, group_name: item.name });
                    dispatch(setSelectedGroupId(item.id));
                    navigation.navigate("GroupDetail", { groupId: item.id })
                }}
                className="py-3"
            >
                <View className="flex flex-row items-center justify-between w-full">
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-full bg-slate-200 mr-3 items-center justify-center">
                            <Text className="text-lg font-semibold text-slate-700">
                                {item.name
                                    ?.split(" ")
                                    ?.map((s) => s[0])
                                    ?.slice(0, 2)
                                    ?.join("") || "??"}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-slate-900">
                                {item.name}
                            </Text>
                            {item.users && (
                                <Text className="text-sm text-slate-500 mt-0.5">{item.users.map((user) => user.name).join(", ")}</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={{ alignItems: 'center', justifyContent: 'center', padding: 8, minWidth: 40 }}
                    >
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    const renderHiddenItem = (data: any, rowMap: any) => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            
        </View>
    );

    return (
        <SafeAreaView className="flex-1 px-4">
            <Text className="text-4xl font-bold mb-4">Nhóm</Text>
            {/* <FlatList data={groups} keyExtractor={(g) => g.id} renderItem={renderItem} /> */}
            {groups.length > 0 ? (
            <SwipeListView
                data={groups}
                keyExtractor={(g) => (g?.id ? String(g.id) : `${g.name}-${g.createdAt}`)}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                leftOpenValue={0}
                rightOpenValue={-75} // Move to the left to reveal delete button
                disableRightSwipe={true}
            />
            ) : (
                <Text className="text-center text-gray-500">Không có nhóm</Text>
            )}
            <TouchableOpacity onPress={() => navigation.navigate("GroupForm", { type: 'add', groupData: { id: '', name: '', users: [], createdAt: '' } })} className="absolute right-6 bottom-8 w-14 h-14 bg-[#0F6BF0] rounded-full items-center justify-center shadow-lg">
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
            <LoadingOverlay visible={loading} />
        </SafeAreaView>
    );
}
