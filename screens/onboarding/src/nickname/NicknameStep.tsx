import { useTranslation } from '@vitapact/i18n';
import { Button, Card, TextField } from '@vitapact/ui';
import { useState, type FormEvent } from 'react';
import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import { nicknameLength, nicknameProblem, type NicknameProblem } from './nickname';

export interface NicknameStepProps {
  nickname: string;
  onChange: (nickname: string) => void;
  onContinue: () => void;
}

function useProblemMessage() {
  const { t } = useTranslation('onboarding');
  const messages: Record<NicknameProblem, string> = {
    empty: t('nickname.empty'),
    tooLong: t('nickname.tooLong', { max: NICKNAME_MAX_LENGTH }),
    unprintable: t('nickname.unprintable'),
  };
  return (problem: NicknameProblem | undefined) => problem && messages[problem];
}

/**
 * The error appears only after a first try to continue, so an empty field is not flagged before
 * the user has typed anything; from then on it follows every keystroke.
 */
export function NicknameStep({ nickname, onChange, onContinue }: NicknameStepProps) {
  const { t } = useTranslation('onboarding');
  const problemMessage = useProblemMessage();
  const [triedToContinue, setTriedToContinue] = useState(false);
  const problem = nicknameProblem(nickname);
  const error = triedToContinue ? problemMessage(problem) : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTriedToContinue(true);
    if (problem) return;
    onChange(nickname.trim());
    onContinue();
  };

  return (
    <Card>
      <form noValidate onSubmit={submit}>
        <TextField
          label={t('nickname.label')}
          value={nickname}
          onChange={onChange}
          description={t('nickname.counter', {
            length: nicknameLength(nickname),
            max: NICKNAME_MAX_LENGTH,
          })}
          {...(error && { error })}
        />
        <Button type="submit">{t('continue')}</Button>
      </form>
    </Card>
  );
}
