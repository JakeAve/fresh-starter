// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_500 from "./routes/_500.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $account_middleware from "./routes/account/_middleware.ts";
import * as $account_index from "./routes/account/index.tsx";
import * as $api_middleware from "./routes/api/_middleware.ts";
import * as $api_auth_generate_authentication_options from "./routes/api/auth/generate-authentication-options.ts";
import * as $api_auth_login from "./routes/api/auth/login.ts";
import * as $api_auth_logout from "./routes/api/auth/logout.ts";
import * as $api_auth_verify_authentication from "./routes/api/auth/verify-authentication.ts";
import * as $api_user_middleware from "./routes/api/user/_middleware.ts";
import * as $api_user_email from "./routes/api/user/email.ts";
import * as $api_user_handle from "./routes/api/user/handle.ts";
import * as $api_user_index from "./routes/api/user/index.ts";
import * as $api_user_name from "./routes/api/user/name.ts";
import * as $api_user_passkey_delete from "./routes/api/user/passkey/delete.ts";
import * as $api_user_passkey_edit from "./routes/api/user/passkey/edit.ts";
import * as $api_user_passkey_generate_registration_options from "./routes/api/user/passkey/generate-registration-options.ts";
import * as $api_user_passkey_verify_registration from "./routes/api/user/passkey/verify-registration.ts";
import * as $api_user_password from "./routes/api/user/password.ts";
import * as $api_validate_email_middleware from "./routes/api/validate/email/_middleware.ts";
import * as $api_validate_email_index from "./routes/api/validate/email/index.ts";
import * as $api_validate_handle from "./routes/api/validate/handle.ts";
import * as $api_validate_name from "./routes/api/validate/name.ts";
import * as $api_validate_password from "./routes/api/validate/password.ts";
import * as $forgot_password_index from "./routes/forgot-password/index.tsx";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $login_index from "./routes/login/index.tsx";
import * as $reset_password_middleware from "./routes/reset-password/_middleware.ts";
import * as $reset_password_index from "./routes/reset-password/index.tsx";
import * as $signup_index from "./routes/signup/index.tsx";
import * as $verify_email_index from "./routes/verify-email/index.tsx";
import * as $verify_password_reset_index from "./routes/verify-password-reset/index.tsx";
import * as $EmailInput from "./islands/EmailInput.tsx";
import * as $ForgotPasswordForm from "./islands/ForgotPasswordForm.tsx";
import * as $HandleInput from "./islands/HandleInput.tsx";
import * as $LoginForm from "./islands/LoginForm.tsx";
import * as $NameInput from "./islands/NameInput.tsx";
import * as $PasskeyEditDelete from "./islands/PasskeyEditDelete.tsx";
import * as $PasswordInput from "./islands/PasswordInput.tsx";
import * as $PasswordPairInputs from "./islands/PasswordPairInputs.tsx";
import * as $PasswordStrengthIndicator from "./islands/PasswordStrengthIndicator.tsx";
import * as $Redirect from "./islands/Redirect.tsx";
import * as $RegisterPasskey from "./islands/RegisterPasskey.tsx";
import * as $ResendEmailVerificationForm from "./islands/ResendEmailVerificationForm.tsx";
import * as $ResetPasswordForm from "./islands/ResetPasswordForm.tsx";
import * as $UpdateEmailForm from "./islands/UpdateEmailForm.tsx";
import * as $UpdateHandleForm from "./islands/UpdateHandleForm.tsx";
import * as $UpdateNameForm from "./islands/UpdateNameForm.tsx";
import * as $UpdatePasswordForm from "./islands/UpdatePasswordForm.tsx";
import * as $UserDropDown from "./islands/UserDropDown.tsx";
import * as $VerifyEmailForm from "./islands/VerifyEmailForm.tsx";
import * as $VerifyPasswordResetCodeForm from "./islands/VerifyPasswordResetCodeForm.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_500.tsx": $_500,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/_middleware.ts": $_middleware,
    "./routes/account/_middleware.ts": $account_middleware,
    "./routes/account/index.tsx": $account_index,
    "./routes/api/_middleware.ts": $api_middleware,
    "./routes/api/auth/generate-authentication-options.ts":
      $api_auth_generate_authentication_options,
    "./routes/api/auth/login.ts": $api_auth_login,
    "./routes/api/auth/logout.ts": $api_auth_logout,
    "./routes/api/auth/verify-authentication.ts":
      $api_auth_verify_authentication,
    "./routes/api/user/_middleware.ts": $api_user_middleware,
    "./routes/api/user/email.ts": $api_user_email,
    "./routes/api/user/handle.ts": $api_user_handle,
    "./routes/api/user/index.ts": $api_user_index,
    "./routes/api/user/name.ts": $api_user_name,
    "./routes/api/user/passkey/delete.ts": $api_user_passkey_delete,
    "./routes/api/user/passkey/edit.ts": $api_user_passkey_edit,
    "./routes/api/user/passkey/generate-registration-options.ts":
      $api_user_passkey_generate_registration_options,
    "./routes/api/user/passkey/verify-registration.ts":
      $api_user_passkey_verify_registration,
    "./routes/api/user/password.ts": $api_user_password,
    "./routes/api/validate/email/_middleware.ts":
      $api_validate_email_middleware,
    "./routes/api/validate/email/index.ts": $api_validate_email_index,
    "./routes/api/validate/handle.ts": $api_validate_handle,
    "./routes/api/validate/name.ts": $api_validate_name,
    "./routes/api/validate/password.ts": $api_validate_password,
    "./routes/forgot-password/index.tsx": $forgot_password_index,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
    "./routes/login/index.tsx": $login_index,
    "./routes/reset-password/_middleware.ts": $reset_password_middleware,
    "./routes/reset-password/index.tsx": $reset_password_index,
    "./routes/signup/index.tsx": $signup_index,
    "./routes/verify-email/index.tsx": $verify_email_index,
    "./routes/verify-password-reset/index.tsx": $verify_password_reset_index,
  },
  islands: {
    "./islands/EmailInput.tsx": $EmailInput,
    "./islands/ForgotPasswordForm.tsx": $ForgotPasswordForm,
    "./islands/HandleInput.tsx": $HandleInput,
    "./islands/LoginForm.tsx": $LoginForm,
    "./islands/NameInput.tsx": $NameInput,
    "./islands/PasskeyEditDelete.tsx": $PasskeyEditDelete,
    "./islands/PasswordInput.tsx": $PasswordInput,
    "./islands/PasswordPairInputs.tsx": $PasswordPairInputs,
    "./islands/PasswordStrengthIndicator.tsx": $PasswordStrengthIndicator,
    "./islands/Redirect.tsx": $Redirect,
    "./islands/RegisterPasskey.tsx": $RegisterPasskey,
    "./islands/ResendEmailVerificationForm.tsx": $ResendEmailVerificationForm,
    "./islands/ResetPasswordForm.tsx": $ResetPasswordForm,
    "./islands/UpdateEmailForm.tsx": $UpdateEmailForm,
    "./islands/UpdateHandleForm.tsx": $UpdateHandleForm,
    "./islands/UpdateNameForm.tsx": $UpdateNameForm,
    "./islands/UpdatePasswordForm.tsx": $UpdatePasswordForm,
    "./islands/UserDropDown.tsx": $UserDropDown,
    "./islands/VerifyEmailForm.tsx": $VerifyEmailForm,
    "./islands/VerifyPasswordResetCodeForm.tsx": $VerifyPasswordResetCodeForm,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
