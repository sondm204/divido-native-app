import { Alert, Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BACKGROUND_COLOR, ERROR_COLOR, TEXT_COLOR } from "../commons/constants";
import AppInput from "../components/AppInput";
import { useState } from "react";
import { MoveRight, Plus, Trash2 } from "lucide-react-native";
import AppButton from "../components/AppButton";

type MapInput = {
    name: string;
    amount: number;
}

type MapResult = {
    from: string;
    to: string;
    amount: number;
}

export const FeaturesScreen: React.FC = () => {
    const [mapInput, setMapInput] = useState<MapInput[]>([]);
    const [mapResult, setMapResult] = useState<MapResult[]>([]);
    const handleNameChange = (index: number, text: string) => {
        const newMapInput = [...mapInput];
        newMapInput[index].name = text;
        setMapInput(newMapInput);
    }
    const handleAmountChange = (index: number, text: string) => {
        const newMapInput = [...mapInput];
        newMapInput[index].amount = parseInt(text) || 0;
        setMapInput(newMapInput);
    }
    const handleRemovePerson = (index: number) => {
        const newMapInput = [...mapInput];
        newMapInput.splice(index, 1);
        setMapInput(newMapInput);
    }
    const handleAddPerson = () => {
        setMapInput([...mapInput, { name: '', amount: 0 }]);
    }
    const handleCalculate = () => {
        setMapResult([]);
        if (mapInput.some(item => item.name == null || item.name == '')) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên người');
            return;
        }
        const names = mapInput.map(item => item.name.trim().toLowerCase());
        const uniqueNames = new Set(names);
        if (names.length !== uniqueNames.size) {
            Alert.alert('Thông báo', 'Tên người không được trùng lặp');
            return;
        }
        //sort by amount
        const sortedMapInput = mapInput.sort((a, b) => a.amount - b.amount);
        const average = mapInput.reduce((acc, item) => acc + item.amount, 0) / mapInput.length;

        const balance = sortedMapInput.map(item => ({ ...item, balance: item.amount - average }));
        const negativeBalance = balance.filter(item => item.balance < 0).map(item => ({ name: item.name, amount: Math.abs(item.balance) }));
        const positiveBalance = balance.filter(item => item.balance > 0).map(item => ({ name: item.name, amount: item.balance }));

        const results: MapResult[] = [];
        let i = 0, j = 0;
        while (i < negativeBalance.length && j < positiveBalance.length) {
            if (negativeBalance[i].amount < positiveBalance[j].amount) {
                results.push({ from: negativeBalance[i].name, to: positiveBalance[j].name, amount: negativeBalance[i].amount });
                positiveBalance[j].amount -= negativeBalance[i].amount;
                negativeBalance[i].amount = 0;
                i++;
            } else if (negativeBalance[i].amount > positiveBalance[j].amount) {
                results.push({ from: negativeBalance[i].name, to: positiveBalance[j].name, amount: positiveBalance[j].amount });
                negativeBalance[i].amount -= positiveBalance[j].amount;
                positiveBalance[j].amount = 0;
                j++;
            } else {
                results.push({ from: negativeBalance[i].name, to: positiveBalance[j].name, amount: positiveBalance[j].amount });
                negativeBalance[i].amount = 0;
                positiveBalance[j].amount = 0;
                i++;
                j++;
            }
        }
        setMapResult(results);
    }
    const handleReset = () => {
        setMapInput([]);
        setMapResult([]);
    }
    return (
        <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: BACKGROUND_COLOR, flex: 1 }}>
            <Text className="text-4xl font-bold mb-4 text-center" style={{ color: TEXT_COLOR }}>Chia tiền nhanh</Text>
            <View className="flex-col gap-2">
                {mapInput.map((item, index) => (
                    <View key={index} className="flex-row gap-1">
                        <View className="w-5/12">
                            <AppInput
                                value={item.name}
                                placeholder="Tên người"
                                onChangeText={(text) => handleNameChange(index, text)}
                            />
                        </View>
                        <View className="w-5/12">
                            <AppInput
                                value={item.amount.toString()}
                                keyboardType="numeric"
                                placeholder="Số tiền"
                                onChangeText={(text) => handleAmountChange(index, text)}
                            />
                        </View>
                        <TouchableOpacity className="w-2/12 items-center justify-center" onPress={() => handleRemovePerson(index)}>
                            <Trash2 size={28} color={ERROR_COLOR} />
                        </TouchableOpacity>
                    </View>
                ))}
                <View className="flex-row mt-4 gap-1">
                    <TouchableOpacity onPress={handleAddPerson} className="w-12 items-center justify-center p-2 border border-slate-700 rounded-lg">
                        <Plus size={28} color={TEXT_COLOR} />
                    </TouchableOpacity>
                    <AppButton className="flex-1" title="Chia tiền" onPress={handleCalculate} variant="primary" disabled={mapInput.length === 0} />
                </View>
                {mapResult.length > 0 && (
                    <View className="flex-col gap-2 border border-slate-700 rounded-lg p-4">
                        <Text className="text-2xl font-bold mb-4 text-center" style={{ color: TEXT_COLOR }}>Kết quả</Text>
                        {mapResult.map((item, index) => (
                            <View key={index} className="flex-row items-center justify-center w-1/2">
                                <View className="flex-1">
                                    <Text
                                        className="text-base font-semibold"
                                        style={{ color: TEXT_COLOR }}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.from}
                                    </Text>
                                </View>

                                <View className="mx-3 mb-4 flex-1 items-center justify-center">
                                    <Text className="text-xs font-medium text-green-500">
                                        {Math.round(item.amount).toLocaleString()}
                                    </Text>
                                    <MoveRight size={28} color={TEXT_COLOR} />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className="text-base font-semibold"
                                        style={{ color: TEXT_COLOR }}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.to}
                                    </Text>
                                </View>
                            </View>

                        ))}
                        <AppButton title="Xóa kết quả" onPress={handleReset} variant="primary" />
                    </View>
                )}
            </View>
        </SafeAreaView >
    );
}