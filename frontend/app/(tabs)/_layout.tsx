import { Tabs } from 'expo-router';
import { TabBar } from '../../components/tabBar';

export default function TabLayout() {

    return (
        <Tabs
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: '#0b1326' }, // Alpine 'surface' color
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ title: 'Home' }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{ title: 'Leaderboard' }}
            />
            <Tabs.Screen
                name="routeShare"
                options={{ title: 'Routes' }}
            />
            <Tabs.Screen
                name="profile"
                options={{ title: 'Profil' }}
            />
        </Tabs>
    );
}