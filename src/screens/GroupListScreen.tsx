import React, { useEffect, useState } from "react";
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
import { Trash2, Trash, House } from "lucide-react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mixpanel } from "../utils/mixpanel";
import CustomModal from "../components/CustomModal";
import { BACKGROUND_COLOR, CARD_COLOR, TEXT_COLOR } from "../commons/constants";


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

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    useEffect(() => {
        Mixpanel.trackScreenView("GroupsList");
        Mixpanel.timeEvent("Fetch Groups Duration");
        if (groups.length === 0) {
            dispatch(fetchGroups());
        }
    }, [dispatch]);

    function handleDelete(groupId: string) {
        Mixpanel.track("Group Delete Click", { group_id: groupId });
        dispatch(deleteGroup(groupId));
        setConfirmVisible(false);
        setPendingDeleteId(null);
    }

    function openDeleteConfirm(groupId: string) {
        setPendingDeleteId(groupId);
        setConfirmVisible(true);
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function renderItem({ item }: { item: Group }) {
        return (
            <TouchableOpacity
                onPress={() => {
                    Mixpanel.track("Group Item Click", { group_id: item.id, group_name: item.name });
                    dispatch(setSelectedGroupId(item.id));
                    navigation.navigate("GroupDetail", { groupId: item.id })
                }}
                className="py-2"
            >
                <View className="relative flex flex-row items-center justify-between w-full rounded-xl p-4" style={{ backgroundColor: CARD_COLOR }}>
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
                            <Text className="font-bold text-lg" style={{ color: TEXT_COLOR }}>
                                {item.name}
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-slate-500 mt-0.5">{item.users?.length} thành viên</Text>
                                <Text className="text-md font-semibold text-right mt-0.5" style={{ color: TEXT_COLOR }}>{item.totalUserAmount?.toLocaleString('vi-VN')} đ</Text>

                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-right text-slate-500 mt-0.5">{formatDate(item.createdAt)}</Text>
                                <Text className="text-sm text-right text-slate-500 mt-0.5">Tổng: {item.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="absolute right-0 top-0 items-center justify-center p-4 min-w-10"
                        onPress={() => openDeleteConfirm(item.id)}
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
        <SafeAreaView className="flex-1 px-4" style={{ backgroundColor: BACKGROUND_COLOR }}>
            <Text className="text-4xl font-bold mb-4 text-center" style={{ color: TEXT_COLOR }}>Nhóm</Text>
            {groups.length > 0 ? (
                <FlatList data={groups} keyExtractor={(g) => g.id} renderItem={renderItem} />
            ) : (
                <Text className="text-center text-gray-500">Không có nhóm</Text>
            )}
            <LoadingOverlay visible={loading} />
            <CustomModal
                visible={confirmVisible}
                onClose={() => { setConfirmVisible(false); setPendingDeleteId(null); }}
                onConfirm={() => { if (pendingDeleteId) { handleDelete(pendingDeleteId); } }}
                confirmText="Xóa"
            >
                <Text style={{ color: TEXT_COLOR }}>Bạn có chắc muốn xóa nhóm này?</Text>
            </CustomModal>
        </SafeAreaView>
    );
}
