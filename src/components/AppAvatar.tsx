import { TouchableOpacity, View, Text } from "react-native";

export const AppAvatar: React.FC<{
    name: string;
    active?: boolean;
    onPress?: () => void;
    small?: boolean;
  }> = ({ name, active, onPress, small = false }) => {
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
  
    return (
      <TouchableOpacity onPress={onPress} className="items-center mr-4 mb-2">
        <View
          className={`rounded-full items-center justify-center ${small ? "w-10 h-10" : "w-12 h-12"
            } ${active ? "bg-[#0F6BF0]" : "bg-slate-200"}`}
        >
          <Text className={`font-semibold ${active ? "text-white" : "text-slate-700"}`}>
            {initials}
          </Text>
        </View>
        <Text numberOfLines={1} className="text-xs mt-1 max-w-16 text-center text-slate-600">
          {name}
        </Text>
      </TouchableOpacity>
    );
  };