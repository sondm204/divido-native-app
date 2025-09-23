import { View, Text } from "react-native";

export const AppSectionCard: React.FC<{
    title?: string;
    children: React.ReactNode;
    extra?: React.ReactNode;
  }> = ({ title, children, extra }) => (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      {!!title && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-slate-900">{title}</Text>
          {extra}
        </View>
      )}
      {children}
    </View>
  );