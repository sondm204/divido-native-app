import { TouchableOpacity, View, Text, ViewStyle, TextStyle } from "react-native";

export type SegmentOption<T extends string = string> = {
  label: string;   // label hiển thị
  value: T;        // giá trị khi chọn
};

export type SegmentProps<T extends string = string> = {
  options: SegmentOption<T>[]; // danh sách option
  current: T;                  // giá trị đang chọn
  onChange: (value: T) => void; // callback khi chọn
  containerStyle?: ViewStyle;   // style tùy chỉnh container
  optionStyle?: ViewStyle;      // style tùy chỉnh từng option
  textStyle?: TextStyle;        // style tùy chỉnh text
  activeOptionStyle?: ViewStyle; // style khi option được chọn
  activeTextStyle?: TextStyle;   // style khi text được chọn
};

export function Segment<T extends string = string>({
  options,
  current,
  onChange,
  containerStyle,
  optionStyle,
  textStyle,
  activeOptionStyle,
  activeTextStyle,
}: SegmentProps<T>) {
  return (
    <View
      className="bg-slate-100 rounded-xl p-1 flex-row"
      style={containerStyle}
    >
      {options.map((opt) => {
        const isActive = current === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`px-3 py-2 rounded-lg ${isActive ? "bg-white shadow" : ""}`}
            style={[optionStyle, isActive && activeOptionStyle]}
          >
            <Text
              className={`text-xs font-medium ${
                isActive ? "text-[#0F6BF0]" : "text-slate-600"
              }`}
              style={[textStyle, isActive && activeTextStyle]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
