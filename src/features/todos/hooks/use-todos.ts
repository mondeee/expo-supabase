import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { todosService } from '@/features/todos/services/todos.service';

const todosKey = (userId?: string) => ['todos', userId] as const;

export function useTodos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: todosKey(user?.id),
    queryFn: () => todosService.list(user!.id),
    enabled: !!user
  });
}

export function useCreateTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => {
      if (!user) throw new Error('You must be signed in.');
      return todosService.create(user.id, title);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey(user?.id) })
  });
}

export function useToggleTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isComplete }: { id: string; isComplete: boolean }) => {
      if (!user) throw new Error('You must be signed in.');
      return todosService.toggle(user.id, id, isComplete);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey(user?.id) })
  });
}

export function useDeleteTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('You must be signed in.');
      return todosService.remove(user.id, id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey(user?.id) })
  });
}
