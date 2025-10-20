import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BACKGROUND_COLOR, TEXT_COLOR } from "../commons/constants";
import AppInput from "../components/AppInput";
import { useState } from "react";

type MapInput = {
    name: string;
    amount: number;
}

export const FeaturesScreen: React.FC = () => {
    const [mapInput, setMapInput] = useState<MapInput[]>([
        { name: 'Sơn', amount: 12000 },
    ]);
    return (
        <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: BACKGROUND_COLOR, flex: 1 }}>
            <Text className="text-4xl font-bold mb-4 text-center" style={{ color: TEXT_COLOR }}>Chia tiền nhanh</Text>
            <View className="flex gap-2">
                {mapInput.map((item, index) => (
                    <View key={index} className="flex-row gap-1">
                        <AppInput className="flex-1 text-lg" placeholder="Tên người" />
                        <AppInput keyboardType="numeric" className="flex-1 bg-green-500 text-lg" placeholder="Số tiền" />
                    </View>
                ))}
                <View className="flex-row gap-1">
                    <AppInput className="flex-1 text-lg" placeholder="Tên người" />
                    <AppInput keyboardType="numeric" className="flex-1 bg-green-500 text-lg" placeholder="Số tiền" />
                </View>
            </View>
        </SafeAreaView >
    );
}