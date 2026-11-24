import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useCreateTodo, useDeleteTodo, useTodos, useToggleTodo } from '@/features/todos/hooks/use-todos';
import { useTodoRealtime } from '@/features/todos/hooks/use-todo-realtime';

export default function TodosScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const todosQuery = useTodos();
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  useTodoRealtime(user?.id);

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await createTodo.mutateAsync(trimmed);
      setTitle('');
    } catch (error) {
      Alert.alert('Could not add todo', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-4 pt-3">
      <View className="mb-4 gap-1">
        <Text className="text-2xl font-bold text-slate-900">Your todos</Text>
        <Text className="text-sm text-slate-600">A working Supabase CRUD + Realtime example.</Text>
      </View>

      <View className="mb-4 flex-row gap-2">
        <TextInput
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3"
          placeholder="Add a task..."
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleCreate}
          returnKeyType="done"
        />
        <Pressable className="justify-center rounded-xl bg-brand-600 px-5" onPress={handleCreate} disabled={createTodo.isPending}>
          <Text className="font-semibold text-white">{createTodo.isPending ? '...' : 'Add'}</Text>
        </Pressable>
      </View>

      {todosQuery.isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : todosQuery.isError ? (
        <View className="rounded-xl bg-red-50 p-4">
          <Text className="font-semibold text-red-700">Could not load todos</Text>
          <Text className="mt-1 text-sm text-red-600">{todosQuery.error.message}</Text>
        </View>
      ) : (
        <FlatList
          data={todosQuery.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 pb-8"
          ListEmptyComponent={<Text className="py-10 text-center text-slate-500">No tasks yet. Add your first one above.</Text>}
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <Pressable className="min-w-0 flex-1" onPress={() => toggleTodo.mutate({ id: item.id, isComplete: !item.is_complete })}>
                <Text className={item.is_complete ? 'text-slate-400 line-through' : 'font-medium text-slate-900'}>
                  {item.title}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">{item.is_complete ? 'Completed' : 'Tap to mark complete'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => deleteTodo.mutate(item.id)}
                className="rounded-lg bg-red-50 px-3 py-2"
              >
                <Text className="font-medium text-red-700">Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
