import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

export const useRegister = () => {
  const router = useRouter();
  const loading = ref(false);

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
      firstName: z
        .string(ts('inputs.firstName.errors.required'))
        .min(1, ts('inputs.firstName.errors.required'))
        .max(50, ts('inputs.firstName.errors.maxLength')),
      lastName: z
        .string(ts('inputs.lastName.errors.required'))
        .min(1, ts('inputs.lastName.errors.required'))
        .max(50, ts('inputs.lastName.errors.maxLength')),
      email: z.email(ts('inputs.email.error')),
      password: z
        .string(ts('inputs.password.errors.minLength'))
        .min(12, ts('inputs.password.errors.minLength'))
        .regex(/[a-z]/, ts('inputs.password.errors.lowercase'))
        .regex(/[A-Z]/, ts('inputs.password.errors.uppercase'))
        .regex(/[0-9]/, ts('inputs.password.errors.number'))
        .regex(/[^A-Za-z0-9]/, ts('inputs.password.errors.symbol')),
      confirmPassword: z.string(ts('inputs.confirmPassword.error')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: ts('inputs.confirmPassword.error'),
      path: ['confirmPassword'],
    });

  type Schema = z.output<typeof schema>;

  const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
    loading.value = true;

    const { status } = await useAPI('/iam/register-user', {
      method: 'POST',
      body: JSON.stringify({
        firstName: payload.data.firstName,
        lastName: payload.data.lastName,
        email: payload.data.email,
        password: payload.data.password,
      }),
      cache: 'no-cache',
      onResponseError: ({ response }) => notifyApiError(response, tsE),
    });

    if (status.value === 'success') router.push('/confirm-email-pending');
    loading.value = false;
  };

  return {
    loading,
    fields,
    providers,
    schema,
    onSubmit,
  };
};
