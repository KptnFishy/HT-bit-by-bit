import { Tabs } from 'expo-router';

export default function TabBar() {
    return (
        <Tabs>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="leaderboard" />
            <Tabs.Screen name="routeShare" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}