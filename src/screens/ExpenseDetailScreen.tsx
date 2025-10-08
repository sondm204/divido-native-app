import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, TextInput, Pressable, Image } from "react-native";
import type { Expense, Bill } from "../store/slices/expensesSlice"; // file chứa các interface của bạn
import { RootStackParamList } from "../../App";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { deleteMultipleBills, fetchBill } from "../store/slices/groupsSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import LoadingOverlay from "../components/LoadingOverlay";
import AppButton from "../components/AppButton";
import CustomModal from "../components/CustomModal";
import AppInput from "../components/AppInput";
import { createBill, updateBill } from "../store/slices/groupsSlice";
import { User } from "../store/slices/userSlice";
import { Modal, Button } from "react-native";

import { useNavigation } from "@react-navigation/native"; // ✅ thêm useNavigation
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronLeft } from "lucide-react-native";
type ExpenseDetailScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ExpenseDetail"
>;


type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

export default function ExpenseDetailScreen() {
    const navigation = useNavigation<ExpenseDetailScreenNavigationProp>();

    const route = useRoute<ExpenseDetailRouteProp>();
    const { expenseId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const expense = useSelector((state: RootState) => state.groups.selectedGroupId ? state.groups.groups.find(group => group.id === state.groups.selectedGroupId)?.expenses?.find(expense => expense.id === expenseId) : null);
    const groupUsers = useSelector((state: RootState) => state.groups.selectedGroupId ? (state.groups.groups.find(g => g.id === state.groups.selectedGroupId)?.users || []) : []);
    const loading = useSelector((state: RootState) => state.groups.loading);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [billName, setBillName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [owner, setOwner] = useState<User[]>([]);
    const availableOwners = groupUsers.filter(u => !owner.some(o => o.id === u.id));
    const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    useEffect(() => {
        if (expense?.bills?.length === 0) {
            dispatch(fetchBill(expenseId));
        }
    }, [expenseId]);

    function formatCurrency(value?: number) {
        const n = Number(value || 0);
        return n.toLocaleString("vi-VN");
    }

    const renderBillItem = ({ item }: { item: Bill }) => (
        <TouchableOpacity
            onPress={() => {
                if (selectedBillIds.length > 0) {
                    if (selectedBillIds.includes(item.id)) {
                        setSelectedBillIds(selectedBillIds.filter(id => id !== item.id));
                    } else {
                        setSelectedBillIds([...selectedBillIds, item.id]);
                    }
                } else {
                    setEditingBill(item);
                    setBillName(item.name);
                    setQuantity(String(item.quantity));
                    setUnitPrice(String(item.unitPrice));
                    setOwner(item.owner || []);
                    setModalVisible(true);
                }
            }}
            onLongPress={() => {
                selectedBillIds.includes(item.id) ? setSelectedBillIds(selectedBillIds.filter(id => id !== item.id)) : setSelectedBillIds([...selectedBillIds, item.id]);
            }}
            className={`flex-row items-center px-3 py-4 border-b border-slate-100 active:bg-slate-200 ${selectedBillIds.includes(item.id) ? 'bg-slate-200' : ''}`}>
            <Text style={{ width: '25%' }} className="">{item.name}</Text>
            <Text style={{ width: '10%' }} className="text-center">{item.quantity}</Text>
            <Text style={{ width: '20%' }} className="text-right">{formatCurrency(item.unitPrice)}</Text>
            <Text style={{ width: '20%' }} className="text-right">{formatCurrency(item.totalPrice)}</Text>
            <Text style={{ width: '25%' }} className="text-right">{(item.owner || []).map((o) => o.name).join(", ")}</Text>
        </TouchableOpacity>
    );

    const resetForm = () => {
        setEditingBill(null);
        setBillName("");
        setQuantity("");
        setUnitPrice("");
        setOwner([]);
        setModalVisible(false);
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const onSubmitBill = () => {
        if (!expense) return;
        const q = Number(quantity) || 0;
        const up = Number(unitPrice) || 0;
        const total = q * up;
        const newBill: Bill = {
            id: editingBill?.id || undefined,
            name: billName.trim(),
            quantity: q,
            unitPrice: up,
            totalPrice: total,
            owner: owner
        } as Bill;
        if (editingBill) {
            dispatch(updateBill({ id: editingBill.id, bill: newBill }));
        } else {
            dispatch(createBill({ expenseId: expense.id, bill: newBill }));
        }
        resetForm();
    };

    return (
        <SafeAreaView className="flex-1 p-4">
            <Text className="text-4xl font-bold mb-2 text-white text-center">Chi tiết chi tiêu</Text>

            {/* Thông tin chính */}
            <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-4 shadow">
                <View className="">
                    <Text className="text-base font-semibold mb-1">{expense?.note}</Text>
                    <Text className="text-slate-600">Người chi: {expense?.payer.name}</Text>
                    <Text className="text-slate-600">
                        Ngày: {new Date(expense?.spentAt || "").toLocaleDateString("vi-VN")}
                    </Text>
                    <Text className="text-slate-600">Danh mục: {expense?.category.name}</Text>
                    <Text className="text-slate-900 font-bold mt-2">
                        Tổng: {formatCurrency(expense?.amount || 0)}đ
                    </Text>
                    {(() => {
                        const ratios = expense?.shareRatios || [];
                        const totalRatio = ratios.reduce((sum, r) => sum + Number(r.ratio || 0), 0);
                        const normalized = Math.abs(totalRatio - 1) < 1e-6 && totalRatio > 0;
                        const amount = Number(expense?.amount || 0);
                        return ratios.map((s, index) => {
                            const r = Number(s.ratio || 0);
                            const weight = normalized ? r : (totalRatio > 0 ? r / totalRatio : 0);
                            const shareAmount = Math.round(weight * amount);
                            return (
                                <Text key={`${s.username}-${index}`}>
                                    {s.username}: {formatCurrency(shareAmount)}đ
                                </Text>
                            );
                        });
                    })()}
                </View>
                <TouchableOpacity 
                    onPress={() => setImageModalVisible(true)}
                    className="h-36 w-24 overflow-hidden rounded-lg"
                >
                    <Image 
                        source={{ uri: expense?.imageUrl }} 
                        className="h-full w-full" 
                        style={{ resizeMode: 'cover' }}
                    />
                </TouchableOpacity>
            </View>

            {/* Bảng chi tiết bill */}
            <AppButton className="mb-4" title="Thêm hóa đơn" onPress={openCreateModal} />
            {selectedBillIds.length > 0 && (
                <View className="flex-row gap-2">
                    {selectedBillIds.length === expense?.bills?.length ? (
                        <AppButton className="mb-4 w-1/2" title="Bỏ chọn tất cả" onPress={() => {
                            setSelectedBillIds([]);
                        }} />
                    ) : (
                        <AppButton className="mb-4 w-1/2" title="Chọn tất cả" onPress={() => {
                            setSelectedBillIds(expense?.bills?.map(b => b.id) || []);
                        }} />
                    )}
                    <AppButton className="mb-4 w-1/2" title={`Xóa hóa đơn (${selectedBillIds.length})`} variant="danger" onPress={() => {
                        dispatch(deleteMultipleBills(selectedBillIds));
                        setSelectedBillIds([]);
                        dispatch(fetchBill(expenseId));
                    }} />
                </View>
            )}
            {expense?.bills && expense?.bills.length > 0 && (
                <View className="bg-white rounded-xl shadow border border-slate-200">
                    <View className="flex-row px-3 py-2 border-b border-slate-200">
                        <Text style={{ width: '25%' }} className="font-semibold">Tên món</Text>
                        <Text style={{ width: '10%' }} className="text-center font-semibold">SL</Text>
                        <Text style={{ width: '20%' }} className="text-right font-semibold">Đơn giá</Text>
                        <Text style={{ width: '20%' }} className="text-right font-semibold">Tổng</Text>
                        <Text style={{ width: '25%' }} className="text-right font-semibold">Chủ nhân</Text>
                    </View>
                    <FlatList
                        data={expense?.bills}
                        keyExtractor={(item) => item.id}
                        renderItem={renderBillItem}
                    />
                </View>
            )}
            <CustomModal
                visible={modalVisible}
                onClose={() => { setModalVisible(false); resetForm(); }}
                onConfirm={onSubmitBill}
                confirmText={editingBill ? "Cập nhật" : "Thêm"}
            >
                <View>
                    <Text className="text-base font-semibold mb-3">{editingBill ? "Cập nhật hóa đơn" : "Thêm hóa đơn"}</Text>
                    <View className="gap-3">
                        <AppInput
                            label="Tên món"
                            value={billName}
                            onChangeText={setBillName}
                            placeholder="Nhập tên món"
                        />
                        <AppInput
                            label="Số lượng"
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                        <AppInput
                            label="Đơn giá"
                            value={unitPrice}
                            onChangeText={setUnitPrice}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                        <View className="gap-3">
                            <View className="p-2 border border-slate-200 rounded-lg">
                                <Text className="text-sm text-slate-600 mb-2">Đã chọn</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {owner.length === 0 && (
                                        <Text className="text-slate-400">Chưa chọn ai</Text>
                                    )}
                                    {owner.map((user) => (
                                        <Text
                                            key={user.id || `${user.email || user.name}-${user.name}`}
                                            onPress={() => setOwner(owner.filter((o) => o.id !== user.id))}
                                            className="bg-blue-500 text-white rounded-full py-1 px-4 active:bg-blue-600">
                                            {user.name}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <View className="p-2 border border-slate-200 rounded-lg">
                                <Text className="text-sm text-slate-600 mb-2">Thành viên</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {availableOwners.length === 0 && (
                                        <Text className="text-slate-400">Không còn thành viên</Text>
                                    )}
                                    {availableOwners.map((user) => (
                                        <Text
                                            key={user.id || `${user.email || user.name}-${user.name}`}
                                            onPress={() => setOwner([...owner, user])}
                                            className="bg-slate-100 text-slate-800 rounded-full py-1 px-3 active:bg-slate-200">
                                            {user.name}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </CustomModal>
            
            {/* Image Modal */}
            <Modal
                visible={imageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View className="flex-1 bg-black/90 justify-center items-center">
                    <TouchableOpacity 
                        className="absolute top-12 right-4 z-10"
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Text className="text-white text-lg font-bold">✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="flex-1 w-full justify-center items-center"
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Image 
                            source={{ uri: expense?.imageUrl }} 
                            className="w-full h-4/5"
                            style={{ resizeMode: 'contain' }}
                        />
                    </TouchableOpacity>
                </View>
            </Modal>
            
            <LoadingOverlay visible={loading} text="Đang tải hóa đơn..." />
        </SafeAreaView>
    );
}
