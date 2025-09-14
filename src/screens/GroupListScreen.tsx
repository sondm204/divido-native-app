import React, { useEffect } from "react";
import {
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Text,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups, Group, setCurrentGroup } from "../store/slices/groupsSlice";
import { AppDispatch, RootState } from "../store/store";
import LoadingOverlay from "../components/LoadingOverlay";

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
        dispatch(fetchGroups());
    }, [dispatch]);

    function renderItem({ item }: { item: Group }) {
        return (
            <TouchableOpacity
                onPress={() => {
                    dispatch(setCurrentGroup(item));
                    navigation.navigate("GroupDetail", { groupId: item.id })
                }}
                className="py-3"
            >
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
                            {item.name || "Unnamed Group"}
                        </Text>
                        {item.users && (
                            <Text className="text-sm text-slate-500 mt-0.5">{item.users.map((user) => user.name).join(", ")}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView className="flex-1 px-4">
            <Text className="text-4xl font-bold mb-4">Nhóm</Text>
            <FlatList data={groups} keyExtractor={(g) => g.id} renderItem={renderItem} />
            <TouchableOpacity onPress={() => navigation.navigate("GroupForm", { type: 'add', groupData: { id: '', name: '', users: [], createdAt: '' } })} className="absolute right-6 bottom-8 w-14 h-14 bg-[#0F6BF0] rounded-full items-center justify-center shadow-lg">
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
            <LoadingOverlay visible={loading} text="Đang tải nhóm..." />
        </SafeAreaView>
    );
}
