import { z } from 'zod';
import { passwordSchema, registerSchema } from './src/validators/auth.validators.js';
import { financialProfileSchema } from './src/validators/profile.validators.js';
import { goalSchema } from './src/validators/goal.validators.js';

function show(label, result) {
  if (result.success) {
    console.log(label, '=> PASS');
  } else {
    console.log(label, '=> FAIL:', result.error.issues.map(i => `[${i.path.join('.')}] ${i.message}`).join(' | '));
  }
}

// Email edge cases
show('email a@b', z.string().email().safeParse('a@b'));
show('email a@b.c', z.string().email().safeParse('a@b.c'));
show('email test@test', z.string().email().safeParse('test@test'));

// whitespace-only first name
show('firstName whitespace', registerSchema.safeParse({
  firstName: '   ',
  lastName: 'Test',
  email: 'a@b.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
}));

// password too short - which message shows first
show('password abc', passwordSchema.safeParse('abc'));
show('password alllowercase1!', passwordSchema.safeParse('alllowercase1!'));

// NaN behavior for blank number with coerce
show('age NaN', financialProfileSchema.shape.age.safeParse(NaN));
show('loanAmount NaN', z.coerce.number().positive('x').safeParse(NaN));

// age decimal
show('age 25.5', financialProfileSchema.shape.age.safeParse(25.5));

// goal target date exactly today midnight vs now
const today = new Date();
today.setHours(0,0,0,0);
show('targetDate today midnight', goalSchema.shape.targetDate.safeParse(today.toISOString().slice(0,10)));
