import { ScrollView, Switch, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { BACKGROUND_COLOR, TEXT_COLOR } from "../commons/constants"
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { AppSectionCard } from "../components/AppSectionCard";
import { useState } from "react";
import AppInput from "../components/AppInput";
import { updateUser } from "../store/slices/userSlice";
import AppButton from "../components/AppButton";

export default function WalletScreen() {
    const currentUser = useSelector((state: RootState) => state.users);
    const [totalBudget, setTotalBudget] = useState<number>(currentUser.totalBudget || 0);
    const [foodBudget, setFoodBudget] = useState<number>(currentUser.foodBudget || 0);
    const [entertainmentBudget, setEntertainmentBudget] = useState<number>(currentUser.entertainmentBudget || 0);
    const dispatch = useDispatch<AppDispatch>();
    const [isReminded, setIsReminded] = useState<boolean>(currentUser.reminded || false);

    const handleSaveChanges = async () => {
        const resultAction = await dispatch(updateUser({
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            totalBudget: totalBudget,
            foodBudget: foodBudget,
            entertainmentBudget: entertainmentBudget,
            reminded: isReminded
        }));
        if (updateUser.fulfilled.match(resultAction)) {
            alert("Cập nhật thành công");
        } else {
            alert("Cập nhật thất bại");
        }
    }

    return (
        <SafeAreaView className="flex-1 px-4" style={{ backgroundColor: BACKGROUND_COLOR }}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
                <Text className="text-4xl font-bold mb-4 text-center" style={{ color: TEXT_COLOR }}>Ví của tôi</Text>

                <AppSectionCard title="Tổng ngân sách">
                    <AppInput onChangeText={(text) => setTotalBudget(Number(text))} value={totalBudget.toString()} keyboardType="numeric" />
                </AppSectionCard>
                <AppSectionCard title="Ngân sách ăn">
                    <AppInput onChangeText={(text) => setFoodBudget(Number(text))} value={foodBudget.toString()} keyboardType="numeric" />
                </AppSectionCard>
                <AppSectionCard title="Ngân sách giải trí">
                    <AppInput onChangeText={(text) => setEntertainmentBudget(Number(text))} value={entertainmentBudget.toString()} keyboardType="numeric" />
                </AppSectionCard>

                <AppSectionCard title="Thông báo">
                    <Text className="text-sm text-gray-500">Nhận thông báo khi ngân sách còn lại ít hơn 10% tổng ngân sách</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isReminded ? "#f5dd4b" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setIsReminded(!isReminded)}
                        value={isReminded}
                    />
                </AppSectionCard>

                <AppButton title="Lưu" onPress={handleSaveChanges} />
            </ScrollView>
        </SafeAreaView>
    )
}