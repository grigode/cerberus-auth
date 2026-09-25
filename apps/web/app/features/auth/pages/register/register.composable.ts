import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import { useAuthRepository } from '~/composables/use-repositories.composable';
import {
  createEmailValidation,
  createNameValidation,
  createPasswordValidation,
} from '~/utils/validators';

export const useRegister = () => {
  const router = useRouter();
  const loading = ref(false);
  const authRepo = useAuthRepository();

  const { ts } = useI18nShorter('auth.register.form');
  const { ts: tsE } = useI18nShorter('auth.register.errors');
  const { notifyApiError } = useAuthFeedback();
  const { redirecting, loginWithGoogle } = useGoogleAuth();

  const fields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'firstName',
        type: 'text',
        label: ts('inputs.firstName.label'),
        placeholder: ts('inputs.firstName.placeholder'),
        required: true,
      },
      {
        name: 'lastName',
        type: 'text',
        label: ts('inputs.lastName.label'),
        placeholder: ts('inputs.lastName.placeholder'),
        required: true,
      },
      {
        name: 'email',
        type: 'email',
        label: ts('inputs.email.label'),
        placeholder: ts('inputs.email.placeholder'),
        required: true,
      },
      {
        name: 'password',
        type: 'password',
        label: ts('inputs.password.label'),
        placeholder: ts('inputs.password.placeholder'),
        required: true,
      },
      {
        name: 'confirmPassword',
        type: 'password',
        label: ts('inputs.confirmPassword.label'),
        placeholder: ts('inputs.confirmPassword.placeholder'),
        required: true,
      },
    ];
  });

  const providers = computed(() => [
    {
      label: ts('providers.google'),
      icon: 'i-simple-icons-google',
      onClick: loginWithGoogle,
      loading: redirecting.value,
      class: 'cursor-pointer',
    },
  ]);

  const schema = z
    .object({
      firstName: createNameValidation({
        required: ts('inputs.firstName.errors.required'),
        maxLength: ts('inputs.firstName.errors.maxLength'),
      }),
      lastName: createNameValidation({
        required: ts('inputs.lastName.errors.required'),
        maxLength: ts('inputs.lastName.errors.maxLength'),
      }),
      email: createEmailValidation(ts('inputs.email.error')),
      password: createPasswordValidation({
        minLength: ts('inputs.password.errors.minLength'),
        lowercase: ts('inputs.password.errors.lowercase'),
        uppercase: ts('inputs.password.errors.uppercase'),
        number: ts('inputs.password.errors.number'),
        symbol: ts('inputs.password.errors.symbol'),
      }),
      confirmPassword: z.string(ts('inputs.confirmPassword.error')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: ts('inputs.confirmPassword.error'),
      path: ['confirmPassword'],
    });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    loading.value = true;
    try {
      await authRepo.register({
        firstName: payload.data.firstName,
        lastName: payload.data.lastName,
        email: payload.data.email,
        password: payload.data.password,
      });
      router.push('/confirm-email-pending');
    } catch (err: unknown) {
      notifyApiError(err, tsE);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    fields,
    providers,
    schema,
    onSubmit,
  };
};
