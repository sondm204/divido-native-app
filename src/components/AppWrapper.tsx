import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
type AppWrapperProps = PropsWithChildren<{}>;

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-[#2c333f]">
        {children}
      </View>
    </SafeAreaView>
  );
}


