import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { profileService } from '@/features/profile/services/profile.service';

export function useMyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileService.getMyProfile(user!.id),
    enabled: !!user
  });
}

export function useUpdateMyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fullName: string) => {
      if (!user) throw new Error('You must be signed in.');
      return profileService.updateMyProfile(user.id, fullName);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', profile.id], profile);
    }
  });
}
