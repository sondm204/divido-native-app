import React, { PropsWithChildren } from "react";
import { SafeAreaView, View } from "react-native";

type AppWrapperProps = PropsWithChildren<{}>;

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-[#F7FAFF] pt-14">
        {children}
      </View>
    </SafeAreaView>
  );
}


