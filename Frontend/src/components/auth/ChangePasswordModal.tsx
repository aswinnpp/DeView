import { useEffect, useState, useCallback } from 'react';
import { Input, Button } from '../common';
import { useChangePassword } from '@/hooks/auth/useChangePassword';
import { authService } from '../../services/auth.service';
import store from '../../context/store';
import { logout as logoutAction } from '../../context/authSlice';

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const inputWrapperBase =
  'relative flex items-center bg-white/5 border border-white/10 rounded-xl p-3.5 transition-all duration-300 focus-within:border-brand-primary focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]';

const inputClass =
  'bg-transparent border-none text-white text-sm w-full outline-none placeholder:text-white/50';

const passwordIconClass =
  'text-white/60 mr-3 shrink-0 text-[10px] min-w-5 flex items-center justify-center before:content-[\'⬤\'] before:bg-linear-to-br before:from-brand-primary before:to-brand-secondary before:bg-clip-text before:text-transparent';

const toggleClass =
  'bg-none border-none text-white/60 cursor-pointer p-1 rounded transition-colors duration-300 hover:text-white text-xs min-w-10';

const errorMsgClass = 'text-red-400 text-sm mt-0.5 whitespace-nowrap block';

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const {
    error,
    isStep1Loading,
    isStep2Loading,
    isOldPasswordVerified,
    reset,
    step1,
    step2,
  } = useChangePassword();

  const {
    register: registerOld,
    handleSubmit: submitOld,
    formState: oldFormState,
  } = step1.form;

  const {
    register: registerNew,
    handleSubmit: submitNew,
    formState: newFormState,
  } = step2.form;

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleOldPasswordVisibility = useCallback(
    () => setShowOldPassword((prev) => !prev),
    []
  );

  const toggleNewPasswordVisibility = useCallback(
    () => setShowNewPassword((prev) => !prev),
    []
  );

  const toggleConfirmPasswordVisibility = useCallback(
    () => setShowConfirmPassword((prev) => !prev),
    []
  );

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1000] p-5 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-black rounded-xl max-w-[720px] w-full shadow-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="py-5 px-7 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold">
            Change Password
          </h2>
          <Button
            variant="ghostOutline"
            className="!px-3 !py-2 text-white border-white/20 hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        {/* Body */}
        <div className="p-7">
          <p className="text-white/70 text-sm mb-5">
            {isOldPasswordVerified
              ? 'Enter a new password and confirm it.'
              : 'Enter your current password to continue.'}
          </p>

          {error && <p className={errorMsgClass}>{error}</p>}

          {!isOldPasswordVerified ? (
            <form
              onSubmit={submitOld(async (values) => {
                await step1.onSubmit(values);
              })}
              className="flex flex-col gap-4"
            >
              {/* Old Password */}
              <div>
                <label className="block text-xs text-white/60 mb-2 font-semibold uppercase tracking-wider">
                  Old Password
                </label>

                <div className={inputWrapperBase}>
                  <span className={passwordIconClass} />
                  <Input
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Old Password"
                    className={inputClass}
                    {...registerOld('oldPassword')}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className={toggleClass}
                    onClick={toggleOldPasswordVisibility}
                  >
                    {showOldPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {oldFormState.errors.oldPassword?.message && (
                  <span className={errorMsgClass}>
                    {oldFormState.errors.oldPassword.message}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="!px-4 !py-2 text-white border-white/20 hover:bg-white/10"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isStep1Loading}
                  className="!px-6 !py-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isStep1Loading ? 'Verifying...' : 'Verify Old Password'}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={submitNew(async (values) => {
                const ok = await step2.onSubmit(values);
                if (ok) {
                  onClose();
                  reset();
                  try {
                    await authService.logout();
                  } catch {
                    // Ignore logout failures; tokens are already revoked.
                  }
                  store.dispatch(logoutAction());
                  window.location.replace('/login');
                }
              })}
              className="flex flex-col gap-4"
            >
              {/* New Password */}
              <div>
                <label className="block text-xs text-white/60 mb-2 font-semibold uppercase tracking-wider">
                  New Password
                </label>

                <div className={inputWrapperBase}>
                  <span className={passwordIconClass} />
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    className={inputClass}
                    {...registerNew('newPassword')}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className={toggleClass}
                    onClick={toggleNewPasswordVisibility}
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {newFormState.errors.newPassword?.message && (
                  <span className={errorMsgClass}>
                    {newFormState.errors.newPassword.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs text-white/60 mb-2 font-semibold uppercase tracking-wider">
                  Confirm Password
                </label>

                <div className={inputWrapperBase}>
                  <span className={passwordIconClass} />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    className={inputClass}
                    {...registerNew('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className={toggleClass}
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {newFormState.errors.confirmPassword?.message && (
                  <span className={errorMsgClass}>
                    {newFormState.errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="!px-4 !py-2 text-white border-white/20 hover:bg-white/10"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isStep2Loading}
                  className="!px-6 !py-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isStep2Loading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}