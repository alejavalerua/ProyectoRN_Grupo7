import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {

    const data = Array.from({ length: 20 }, (_, i) => ({
        id: i.toString(),
        title: `Elemento ${i + 1}`
    }));

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, padding: 16 }}>

                <View style={{ maxWidth: 600, width: '100%', alignSelf: 'center', flex: 1 }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20
                    }}>

                        <View>
                            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
                                Bienvenido
                            </Text>
                            <Text style={{ fontSize: 14, color: 'gray' }}>
                                Uninorte
                            </Text>
                        </View>

                        <Ionicons name="notifications-outline" size={28} color="black" />
                    </View>

                    {/* Lista */}
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    marginVertical: 8,
                                    marginHorizontal: 16,
                                    backgroundColor: '#dbeafe',
                                    borderRadius: 16,
                                    padding: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >

                                <View>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                        {item.title}
                                    </Text>
                                    <Text style={{ color: 'gray', fontSize: 13 }}>
                                        Descripción corta del elemento
                                    </Text>
                                </View>

                                {/* Icono */}
                                <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                            </View>
                        )}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}