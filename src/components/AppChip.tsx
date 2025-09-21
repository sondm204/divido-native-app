import { TouchableOpacity, Text } from "react-native";

export const AppChip: React.FC<{
    label: string;
    active?: boolean;
    onPress?: () => void;
  }> = ({ label, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 rounded-full mr-2 mb-2 ${active ? "bg-[#0F6BF0]" : "bg-slate-200"
        }`}
    >
      <Text className={`${active ? "text-white" : "text-slate-700"}`}>{label}</Text>
    </TouchableOpacity>
  );