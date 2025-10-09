import { View, Text } from "react-native";
import { CARD_COLOR, TEXT_COLOR } from "../commons/constants";

export const AppSectionCard: React.FC<{
    title?: string;
    children: React.ReactNode;
    extra?: React.ReactNode;
  }> = ({ title, children, extra }) => (
    <View className="rounded-2xl p-4 shadow-sm mb-4" style={{ backgroundColor: CARD_COLOR  }}>
      {!!title && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold" style={{ color: TEXT_COLOR }}>{title}</Text>
          {extra}
        </View>
      )}
      {children}
    </View>
  );